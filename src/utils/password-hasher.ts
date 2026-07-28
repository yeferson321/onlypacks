/**
 * Hashing de contraseñas con PBKDF2, construido directamente sobre la Web Crypto
 * API nativa. Pensado para runtimes de edge (Cloudflare Workers, Deno Deploy, etc.)
 * sin ninguna dependencia externa.
 *
 * Formato del hash almacenado (autodescriptivo — guarda TODO lo necesario para
 * verificar, sin depender de la configuración actual de la instancia):
 *
 *   PBKDF2$<hashFunction>$<iterations>$<keyLengthBits>$<saltHex>$<hashHex>
 *
 * Guardar la función hash y el keyLength dentro del propio string (en vez de
 * confiar en lo que la instancia tenga configurado *hoy*) es lo que permite que
 * los hashes viejos se sigan verificando bien incluso después de cambiar los
 * valores por defecto (por ejemplo al subir las iteraciones con el tiempo).
 */

const DEFAULT_SALT_LENGTH_BYTES = 16;
const DEFAULT_KEY_LENGTH_BITS = 256;
const DEFAULT_HASH_FUNCTION = "SHA-256";
const DEFAULT_ITERATIONS = 60_000;

// Piso para evitar hashes accidentalmente débiles.
const MIN_ITERATIONS = 10_000;
// Techo para evitar un DoS por agotamiento de CPU si el número de iteraciones
// de un hash llegara a estar corrupto o ser manipulado (backups, migraciones, etc.).
const MAX_ITERATIONS = 1_000_000;
const MIN_SALT_LENGTH_BYTES = 16;
const ALLOWED_HASH_FUNCTIONS = new Set(["SHA-256", "SHA-384", "SHA-512"]);
const ALGORITHM_TAG = "PBKDF2";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("Cadena hexadecimal inválida.");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Comparación en tiempo constante. A diferencia de un `if (a.length !== b.length)
 * return false` inicial, aquí no hay retorno anticipado: siempre se recorre el
 * mismo número de posiciones (el máximo de ambas longitudes) y la diferencia de
 * longitud también se pliega dentro del resultado.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const x = i < a.length ? a[i] : 0;
    const y = i < b.length ? b[i] : 0;
    diff |= x ^ y;
  }
  return diff === 0;
}

export interface PBKDF2Options {
  iterations?: number;
  saltLength?: number;
  keyLength?: number;
  hashFunction?: string;
}

export class PBKDF2Lite {
  private readonly iterations: number;
  private readonly saltLength: number;
  private readonly keyLength: number;
  private readonly hashFunction: string;

  constructor(options: PBKDF2Options = {}) {
    const iterations = options.iterations ?? DEFAULT_ITERATIONS;
    const saltLength = options.saltLength ?? DEFAULT_SALT_LENGTH_BYTES;
    const keyLength = options.keyLength ?? DEFAULT_KEY_LENGTH_BITS;
    const hashFunction = options.hashFunction ?? DEFAULT_HASH_FUNCTION;

    if (
      !Number.isInteger(iterations) ||
      iterations < MIN_ITERATIONS ||
      iterations > MAX_ITERATIONS
    ) {
      throw new RangeError(
        `iterations debe ser un entero entre ${MIN_ITERATIONS} y ${MAX_ITERATIONS} (recibido ${iterations}).`
      );
    }
    if (!Number.isInteger(saltLength) || saltLength < MIN_SALT_LENGTH_BYTES) {
      throw new RangeError(`saltLength debe ser un entero >= ${MIN_SALT_LENGTH_BYTES} bytes.`);
    }
    if (!Number.isInteger(keyLength) || keyLength <= 0 || keyLength % 8 !== 0) {
      throw new RangeError("keyLength debe ser un múltiplo positivo de 8 (bits).");
    }
    if (!ALLOWED_HASH_FUNCTIONS.has(hashFunction)) {
      throw new RangeError(
        `hashFunction debe ser uno de: ${[...ALLOWED_HASH_FUNCTIONS].join(", ")} (recibido ${hashFunction}).`
      );
    }

    this.iterations = iterations;
    this.saltLength = saltLength;
    this.keyLength = keyLength;
    this.hashFunction = hashFunction;
  }

  private static assertValidPassword(password: unknown): asserts password is string {
    if (typeof password !== "string" || password.length === 0) {
      throw new TypeError("password debe ser un string no vacío.");
    }
  }

  /** Genera un hash con un salt nuevo y aleatorio. */
  async hash(password: string): Promise<string> {
    PBKDF2Lite.assertValidPassword(password);

    const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
    const derived = await PBKDF2Lite.derive(
      password,
      salt,
      this.iterations,
      this.hashFunction,
      this.keyLength
    );

    return [
      ALGORITHM_TAG,
      this.hashFunction,
      this.iterations,
      this.keyLength,
      bytesToHex(salt),
      bytesToHex(derived),
    ].join("$");
  }

  /**
   * Verifica una contraseña contra un hash almacenado. Todos los parámetros
   * (función hash, iteraciones, keyLength) se leen del propio hash, no de la
   * configuración de esta instancia — así un cambio futuro en los defaults no
   * rompe la verificación de hashes antiguos.
   */
  async verify(storedHash: string, password: string): Promise<boolean> {
    PBKDF2Lite.assertValidPassword(password);

    const parts = storedHash.split("$");
    if (parts.length !== 6) return false;

    const [tag, hashFunction, iterationsStr, keyLengthStr, saltHex, hashHex] = parts;

    if (tag !== ALGORITHM_TAG) return false;
    if (!ALLOWED_HASH_FUNCTIONS.has(hashFunction)) return false;

    const iterations = Number(iterationsStr);
    const keyLength = Number(keyLengthStr);

    if (
      !Number.isInteger(iterations) ||
      iterations < MIN_ITERATIONS ||
      iterations > MAX_ITERATIONS
    ) {
      // También actúa como salvaguarda contra un número de iteraciones
      // desmesurado que provoque un DoS por CPU al verificar.
      return false;
    }
    if (!Number.isInteger(keyLength) || keyLength <= 0 || keyLength % 8 !== 0) {
      return false;
    }

    let salt: Uint8Array;
    let expected: Uint8Array;
    try {
      salt = hexToBytes(saltHex);
      expected = hexToBytes(hashHex);
    } catch {
      return false;
    }

    const derived = await PBKDF2Lite.derive(password, salt, iterations, hashFunction, keyLength);
    return timingSafeEqual(derived, expected);
  }

  /** Extrae el número de iteraciones almacenado en un hash, sin verificarlo. */
  getIterationsFromHash(storedHash: string): number | null {
    const parts = storedHash.split("$");
    if (parts.length !== 6) return null;
    const iterations = Number(parts[2]);
    return Number.isInteger(iterations) && iterations > 0 ? iterations : null;
  }

  private static async derive(
    password: string,
    salt: Uint8Array,
    iterations: number,
    hashFunction: string,
    keyLengthBits: number
  ): Promise<Uint8Array> {
    // Cast explícito a BufferSource: crypto.subtle exige un ArrayBuffer real
    // (no ArrayBufferLike), y aquí sabemos con certeza que nunca es un
    // SharedArrayBuffer, así que el cast es seguro. Ver nota al final del
    // archivo sobre por qué es necesario en algunos setups de TS.
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password) as BufferSource,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: hashFunction },
      keyMaterial,
      keyLengthBits
    );

    return new Uint8Array(bits);
  }
}

export default PBKDF2Lite;

export async function hashPassword(password: string, options?: PBKDF2Options): Promise<string> {
  return new PBKDF2Lite(options).hash(password);
}

export async function verifyPassword(
  storedHash: string,
  password: string,
  options?: PBKDF2Options
): Promise<boolean> {
  return new PBKDF2Lite(options).verify(storedHash, password);
}

/**
 * Nota sobre los casts a `BufferSource`:
 * Si tu proyecto incluye a la vez `@cloudflare/workers-types` (o `@types/node`)
 * y el `lib: ["dom"]` del compilador, vas a tener dos definiciones distintas de
 * `Uint8Array` compitiendo (una tipada sobre `ArrayBuffer`, otra sobre el más
 * amplio `ArrayBufferLike`, que también cubre `SharedArrayBuffer`). Como
 * `crypto.subtle` exige `BufferSource` (que solo acepta `ArrayBuffer`), TS se
 * queja aunque en tiempo de ejecución el valor sea perfectamente válido. El
 * cast es seguro acá porque `new Uint8Array(n)` y `TextEncoder.encode()`
 * siempre crean un `ArrayBuffer` propio, nunca uno compartido.
 */