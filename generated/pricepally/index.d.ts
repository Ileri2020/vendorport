
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model PricepallyProduct
 * 
 */
export type PricepallyProduct = $Result.DefaultSelection<Prisma.$PricepallyProductPayload>
/**
 * Model PricepallyCategory
 * 
 */
export type PricepallyCategory = $Result.DefaultSelection<Prisma.$PricepallyCategoryPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more PricepallyProducts
 * const pricepallyProducts = await prisma.pricepallyProduct.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more PricepallyProducts
   * const pricepallyProducts = await prisma.pricepallyProduct.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.pricepallyProduct`: Exposes CRUD operations for the **PricepallyProduct** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PricepallyProducts
    * const pricepallyProducts = await prisma.pricepallyProduct.findMany()
    * ```
    */
  get pricepallyProduct(): Prisma.PricepallyProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pricepallyCategory`: Exposes CRUD operations for the **PricepallyCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PricepallyCategories
    * const pricepallyCategories = await prisma.pricepallyCategory.findMany()
    * ```
    */
  get pricepallyCategory(): Prisma.PricepallyCategoryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.9.0
   * Query Engine version: 81e4af48011447c3cc503a190e86995b66d2a28e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    PricepallyProduct: 'PricepallyProduct',
    PricepallyCategory: 'PricepallyCategory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "pricepallyProduct" | "pricepallyCategory"
      txIsolationLevel: never
    }
    model: {
      PricepallyProduct: {
        payload: Prisma.$PricepallyProductPayload<ExtArgs>
        fields: Prisma.PricepallyProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PricepallyProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PricepallyProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>
          }
          findFirst: {
            args: Prisma.PricepallyProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PricepallyProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>
          }
          findMany: {
            args: Prisma.PricepallyProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>[]
          }
          create: {
            args: Prisma.PricepallyProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>
          }
          createMany: {
            args: Prisma.PricepallyProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PricepallyProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>
          }
          update: {
            args: Prisma.PricepallyProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>
          }
          deleteMany: {
            args: Prisma.PricepallyProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PricepallyProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PricepallyProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyProductPayload>
          }
          aggregate: {
            args: Prisma.PricepallyProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePricepallyProduct>
          }
          groupBy: {
            args: Prisma.PricepallyProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<PricepallyProductGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.PricepallyProductFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.PricepallyProductAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.PricepallyProductCountArgs<ExtArgs>
            result: $Utils.Optional<PricepallyProductCountAggregateOutputType> | number
          }
        }
      }
      PricepallyCategory: {
        payload: Prisma.$PricepallyCategoryPayload<ExtArgs>
        fields: Prisma.PricepallyCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PricepallyCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PricepallyCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>
          }
          findFirst: {
            args: Prisma.PricepallyCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PricepallyCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>
          }
          findMany: {
            args: Prisma.PricepallyCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>[]
          }
          create: {
            args: Prisma.PricepallyCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>
          }
          createMany: {
            args: Prisma.PricepallyCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PricepallyCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>
          }
          update: {
            args: Prisma.PricepallyCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>
          }
          deleteMany: {
            args: Prisma.PricepallyCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PricepallyCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PricepallyCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricepallyCategoryPayload>
          }
          aggregate: {
            args: Prisma.PricepallyCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePricepallyCategory>
          }
          groupBy: {
            args: Prisma.PricepallyCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<PricepallyCategoryGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.PricepallyCategoryFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.PricepallyCategoryAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.PricepallyCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<PricepallyCategoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    pricepallyProduct?: PricepallyProductOmit
    pricepallyCategory?: PricepallyCategoryOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model PricepallyProduct
   */

  export type AggregatePricepallyProduct = {
    _count: PricepallyProductCountAggregateOutputType | null
    _min: PricepallyProductMinAggregateOutputType | null
    _max: PricepallyProductMaxAggregateOutputType | null
  }

  export type PricepallyProductMinAggregateOutputType = {
    id: string | null
    source: string | null
    sourceUrl: string | null
    sourceId: string | null
    handle: string | null
    title: string | null
    description: string | null
    importedAt: Date | null
    createdAt: Date | null
  }

  export type PricepallyProductMaxAggregateOutputType = {
    id: string | null
    source: string | null
    sourceUrl: string | null
    sourceId: string | null
    handle: string | null
    title: string | null
    description: string | null
    importedAt: Date | null
    createdAt: Date | null
  }

  export type PricepallyProductCountAggregateOutputType = {
    id: number
    source: number
    sourceUrl: number
    sourceId: number
    handle: number
    title: number
    description: number
    images: number
    categoryRefs: number
    rawProduct: number
    importedAt: number
    createdAt: number
    _all: number
  }


  export type PricepallyProductMinAggregateInputType = {
    id?: true
    source?: true
    sourceUrl?: true
    sourceId?: true
    handle?: true
    title?: true
    description?: true
    importedAt?: true
    createdAt?: true
  }

  export type PricepallyProductMaxAggregateInputType = {
    id?: true
    source?: true
    sourceUrl?: true
    sourceId?: true
    handle?: true
    title?: true
    description?: true
    importedAt?: true
    createdAt?: true
  }

  export type PricepallyProductCountAggregateInputType = {
    id?: true
    source?: true
    sourceUrl?: true
    sourceId?: true
    handle?: true
    title?: true
    description?: true
    images?: true
    categoryRefs?: true
    rawProduct?: true
    importedAt?: true
    createdAt?: true
    _all?: true
  }

  export type PricepallyProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PricepallyProduct to aggregate.
     */
    where?: PricepallyProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyProducts to fetch.
     */
    orderBy?: PricepallyProductOrderByWithRelationInput | PricepallyProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PricepallyProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PricepallyProducts
    **/
    _count?: true | PricepallyProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PricepallyProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PricepallyProductMaxAggregateInputType
  }

  export type GetPricepallyProductAggregateType<T extends PricepallyProductAggregateArgs> = {
        [P in keyof T & keyof AggregatePricepallyProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePricepallyProduct[P]>
      : GetScalarType<T[P], AggregatePricepallyProduct[P]>
  }




  export type PricepallyProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PricepallyProductWhereInput
    orderBy?: PricepallyProductOrderByWithAggregationInput | PricepallyProductOrderByWithAggregationInput[]
    by: PricepallyProductScalarFieldEnum[] | PricepallyProductScalarFieldEnum
    having?: PricepallyProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PricepallyProductCountAggregateInputType | true
    _min?: PricepallyProductMinAggregateInputType
    _max?: PricepallyProductMaxAggregateInputType
  }

  export type PricepallyProductGroupByOutputType = {
    id: string
    source: string
    sourceUrl: string
    sourceId: string
    handle: string | null
    title: string | null
    description: string | null
    images: JsonValue
    categoryRefs: JsonValue
    rawProduct: JsonValue
    importedAt: Date
    createdAt: Date
    _count: PricepallyProductCountAggregateOutputType | null
    _min: PricepallyProductMinAggregateOutputType | null
    _max: PricepallyProductMaxAggregateOutputType | null
  }

  type GetPricepallyProductGroupByPayload<T extends PricepallyProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PricepallyProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PricepallyProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PricepallyProductGroupByOutputType[P]>
            : GetScalarType<T[P], PricepallyProductGroupByOutputType[P]>
        }
      >
    >


  export type PricepallyProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    sourceUrl?: boolean
    sourceId?: boolean
    handle?: boolean
    title?: boolean
    description?: boolean
    images?: boolean
    categoryRefs?: boolean
    rawProduct?: boolean
    importedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["pricepallyProduct"]>



  export type PricepallyProductSelectScalar = {
    id?: boolean
    source?: boolean
    sourceUrl?: boolean
    sourceId?: boolean
    handle?: boolean
    title?: boolean
    description?: boolean
    images?: boolean
    categoryRefs?: boolean
    rawProduct?: boolean
    importedAt?: boolean
    createdAt?: boolean
  }

  export type PricepallyProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "sourceUrl" | "sourceId" | "handle" | "title" | "description" | "images" | "categoryRefs" | "rawProduct" | "importedAt" | "createdAt", ExtArgs["result"]["pricepallyProduct"]>

  export type $PricepallyProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PricepallyProduct"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      source: string
      sourceUrl: string
      sourceId: string
      handle: string | null
      title: string | null
      description: string | null
      images: Prisma.JsonValue
      categoryRefs: Prisma.JsonValue
      rawProduct: Prisma.JsonValue
      importedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["pricepallyProduct"]>
    composites: {}
  }

  type PricepallyProductGetPayload<S extends boolean | null | undefined | PricepallyProductDefaultArgs> = $Result.GetResult<Prisma.$PricepallyProductPayload, S>

  type PricepallyProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PricepallyProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PricepallyProductCountAggregateInputType | true
    }

  export interface PricepallyProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PricepallyProduct'], meta: { name: 'PricepallyProduct' } }
    /**
     * Find zero or one PricepallyProduct that matches the filter.
     * @param {PricepallyProductFindUniqueArgs} args - Arguments to find a PricepallyProduct
     * @example
     * // Get one PricepallyProduct
     * const pricepallyProduct = await prisma.pricepallyProduct.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PricepallyProductFindUniqueArgs>(args: SelectSubset<T, PricepallyProductFindUniqueArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PricepallyProduct that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PricepallyProductFindUniqueOrThrowArgs} args - Arguments to find a PricepallyProduct
     * @example
     * // Get one PricepallyProduct
     * const pricepallyProduct = await prisma.pricepallyProduct.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PricepallyProductFindUniqueOrThrowArgs>(args: SelectSubset<T, PricepallyProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PricepallyProduct that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductFindFirstArgs} args - Arguments to find a PricepallyProduct
     * @example
     * // Get one PricepallyProduct
     * const pricepallyProduct = await prisma.pricepallyProduct.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PricepallyProductFindFirstArgs>(args?: SelectSubset<T, PricepallyProductFindFirstArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PricepallyProduct that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductFindFirstOrThrowArgs} args - Arguments to find a PricepallyProduct
     * @example
     * // Get one PricepallyProduct
     * const pricepallyProduct = await prisma.pricepallyProduct.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PricepallyProductFindFirstOrThrowArgs>(args?: SelectSubset<T, PricepallyProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PricepallyProducts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PricepallyProducts
     * const pricepallyProducts = await prisma.pricepallyProduct.findMany()
     * 
     * // Get first 10 PricepallyProducts
     * const pricepallyProducts = await prisma.pricepallyProduct.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pricepallyProductWithIdOnly = await prisma.pricepallyProduct.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PricepallyProductFindManyArgs>(args?: SelectSubset<T, PricepallyProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PricepallyProduct.
     * @param {PricepallyProductCreateArgs} args - Arguments to create a PricepallyProduct.
     * @example
     * // Create one PricepallyProduct
     * const PricepallyProduct = await prisma.pricepallyProduct.create({
     *   data: {
     *     // ... data to create a PricepallyProduct
     *   }
     * })
     * 
     */
    create<T extends PricepallyProductCreateArgs>(args: SelectSubset<T, PricepallyProductCreateArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PricepallyProducts.
     * @param {PricepallyProductCreateManyArgs} args - Arguments to create many PricepallyProducts.
     * @example
     * // Create many PricepallyProducts
     * const pricepallyProduct = await prisma.pricepallyProduct.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PricepallyProductCreateManyArgs>(args?: SelectSubset<T, PricepallyProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PricepallyProduct.
     * @param {PricepallyProductDeleteArgs} args - Arguments to delete one PricepallyProduct.
     * @example
     * // Delete one PricepallyProduct
     * const PricepallyProduct = await prisma.pricepallyProduct.delete({
     *   where: {
     *     // ... filter to delete one PricepallyProduct
     *   }
     * })
     * 
     */
    delete<T extends PricepallyProductDeleteArgs>(args: SelectSubset<T, PricepallyProductDeleteArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PricepallyProduct.
     * @param {PricepallyProductUpdateArgs} args - Arguments to update one PricepallyProduct.
     * @example
     * // Update one PricepallyProduct
     * const pricepallyProduct = await prisma.pricepallyProduct.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PricepallyProductUpdateArgs>(args: SelectSubset<T, PricepallyProductUpdateArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PricepallyProducts.
     * @param {PricepallyProductDeleteManyArgs} args - Arguments to filter PricepallyProducts to delete.
     * @example
     * // Delete a few PricepallyProducts
     * const { count } = await prisma.pricepallyProduct.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PricepallyProductDeleteManyArgs>(args?: SelectSubset<T, PricepallyProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PricepallyProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PricepallyProducts
     * const pricepallyProduct = await prisma.pricepallyProduct.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PricepallyProductUpdateManyArgs>(args: SelectSubset<T, PricepallyProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PricepallyProduct.
     * @param {PricepallyProductUpsertArgs} args - Arguments to update or create a PricepallyProduct.
     * @example
     * // Update or create a PricepallyProduct
     * const pricepallyProduct = await prisma.pricepallyProduct.upsert({
     *   create: {
     *     // ... data to create a PricepallyProduct
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PricepallyProduct we want to update
     *   }
     * })
     */
    upsert<T extends PricepallyProductUpsertArgs>(args: SelectSubset<T, PricepallyProductUpsertArgs<ExtArgs>>): Prisma__PricepallyProductClient<$Result.GetResult<Prisma.$PricepallyProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PricepallyProducts that matches the filter.
     * @param {PricepallyProductFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const pricepallyProduct = await prisma.pricepallyProduct.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: PricepallyProductFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a PricepallyProduct.
     * @param {PricepallyProductAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const pricepallyProduct = await prisma.pricepallyProduct.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: PricepallyProductAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of PricepallyProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductCountArgs} args - Arguments to filter PricepallyProducts to count.
     * @example
     * // Count the number of PricepallyProducts
     * const count = await prisma.pricepallyProduct.count({
     *   where: {
     *     // ... the filter for the PricepallyProducts we want to count
     *   }
     * })
    **/
    count<T extends PricepallyProductCountArgs>(
      args?: Subset<T, PricepallyProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PricepallyProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PricepallyProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PricepallyProductAggregateArgs>(args: Subset<T, PricepallyProductAggregateArgs>): Prisma.PrismaPromise<GetPricepallyProductAggregateType<T>>

    /**
     * Group by PricepallyProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PricepallyProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PricepallyProductGroupByArgs['orderBy'] }
        : { orderBy?: PricepallyProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PricepallyProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPricepallyProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PricepallyProduct model
   */
  readonly fields: PricepallyProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PricepallyProduct.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PricepallyProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PricepallyProduct model
   */
  interface PricepallyProductFieldRefs {
    readonly id: FieldRef<"PricepallyProduct", 'String'>
    readonly source: FieldRef<"PricepallyProduct", 'String'>
    readonly sourceUrl: FieldRef<"PricepallyProduct", 'String'>
    readonly sourceId: FieldRef<"PricepallyProduct", 'String'>
    readonly handle: FieldRef<"PricepallyProduct", 'String'>
    readonly title: FieldRef<"PricepallyProduct", 'String'>
    readonly description: FieldRef<"PricepallyProduct", 'String'>
    readonly images: FieldRef<"PricepallyProduct", 'Json'>
    readonly categoryRefs: FieldRef<"PricepallyProduct", 'Json'>
    readonly rawProduct: FieldRef<"PricepallyProduct", 'Json'>
    readonly importedAt: FieldRef<"PricepallyProduct", 'DateTime'>
    readonly createdAt: FieldRef<"PricepallyProduct", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PricepallyProduct findUnique
   */
  export type PricepallyProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyProduct to fetch.
     */
    where: PricepallyProductWhereUniqueInput
  }

  /**
   * PricepallyProduct findUniqueOrThrow
   */
  export type PricepallyProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyProduct to fetch.
     */
    where: PricepallyProductWhereUniqueInput
  }

  /**
   * PricepallyProduct findFirst
   */
  export type PricepallyProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyProduct to fetch.
     */
    where?: PricepallyProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyProducts to fetch.
     */
    orderBy?: PricepallyProductOrderByWithRelationInput | PricepallyProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PricepallyProducts.
     */
    cursor?: PricepallyProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PricepallyProducts.
     */
    distinct?: PricepallyProductScalarFieldEnum | PricepallyProductScalarFieldEnum[]
  }

  /**
   * PricepallyProduct findFirstOrThrow
   */
  export type PricepallyProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyProduct to fetch.
     */
    where?: PricepallyProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyProducts to fetch.
     */
    orderBy?: PricepallyProductOrderByWithRelationInput | PricepallyProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PricepallyProducts.
     */
    cursor?: PricepallyProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PricepallyProducts.
     */
    distinct?: PricepallyProductScalarFieldEnum | PricepallyProductScalarFieldEnum[]
  }

  /**
   * PricepallyProduct findMany
   */
  export type PricepallyProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyProducts to fetch.
     */
    where?: PricepallyProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyProducts to fetch.
     */
    orderBy?: PricepallyProductOrderByWithRelationInput | PricepallyProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PricepallyProducts.
     */
    cursor?: PricepallyProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyProducts.
     */
    skip?: number
    distinct?: PricepallyProductScalarFieldEnum | PricepallyProductScalarFieldEnum[]
  }

  /**
   * PricepallyProduct create
   */
  export type PricepallyProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * The data needed to create a PricepallyProduct.
     */
    data: XOR<PricepallyProductCreateInput, PricepallyProductUncheckedCreateInput>
  }

  /**
   * PricepallyProduct createMany
   */
  export type PricepallyProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PricepallyProducts.
     */
    data: PricepallyProductCreateManyInput | PricepallyProductCreateManyInput[]
  }

  /**
   * PricepallyProduct update
   */
  export type PricepallyProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * The data needed to update a PricepallyProduct.
     */
    data: XOR<PricepallyProductUpdateInput, PricepallyProductUncheckedUpdateInput>
    /**
     * Choose, which PricepallyProduct to update.
     */
    where: PricepallyProductWhereUniqueInput
  }

  /**
   * PricepallyProduct updateMany
   */
  export type PricepallyProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PricepallyProducts.
     */
    data: XOR<PricepallyProductUpdateManyMutationInput, PricepallyProductUncheckedUpdateManyInput>
    /**
     * Filter which PricepallyProducts to update
     */
    where?: PricepallyProductWhereInput
    /**
     * Limit how many PricepallyProducts to update.
     */
    limit?: number
  }

  /**
   * PricepallyProduct upsert
   */
  export type PricepallyProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * The filter to search for the PricepallyProduct to update in case it exists.
     */
    where: PricepallyProductWhereUniqueInput
    /**
     * In case the PricepallyProduct found by the `where` argument doesn't exist, create a new PricepallyProduct with this data.
     */
    create: XOR<PricepallyProductCreateInput, PricepallyProductUncheckedCreateInput>
    /**
     * In case the PricepallyProduct was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PricepallyProductUpdateInput, PricepallyProductUncheckedUpdateInput>
  }

  /**
   * PricepallyProduct delete
   */
  export type PricepallyProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
    /**
     * Filter which PricepallyProduct to delete.
     */
    where: PricepallyProductWhereUniqueInput
  }

  /**
   * PricepallyProduct deleteMany
   */
  export type PricepallyProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PricepallyProducts to delete
     */
    where?: PricepallyProductWhereInput
    /**
     * Limit how many PricepallyProducts to delete.
     */
    limit?: number
  }

  /**
   * PricepallyProduct findRaw
   */
  export type PricepallyProductFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PricepallyProduct aggregateRaw
   */
  export type PricepallyProductAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PricepallyProduct without action
   */
  export type PricepallyProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyProduct
     */
    select?: PricepallyProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyProduct
     */
    omit?: PricepallyProductOmit<ExtArgs> | null
  }


  /**
   * Model PricepallyCategory
   */

  export type AggregatePricepallyCategory = {
    _count: PricepallyCategoryCountAggregateOutputType | null
    _min: PricepallyCategoryMinAggregateOutputType | null
    _max: PricepallyCategoryMaxAggregateOutputType | null
  }

  export type PricepallyCategoryMinAggregateOutputType = {
    id: string | null
    source: string | null
    sourceId: string | null
    name: string | null
    handle: string | null
    importedAt: Date | null
    createdAt: Date | null
  }

  export type PricepallyCategoryMaxAggregateOutputType = {
    id: string | null
    source: string | null
    sourceId: string | null
    name: string | null
    handle: string | null
    importedAt: Date | null
    createdAt: Date | null
  }

  export type PricepallyCategoryCountAggregateOutputType = {
    id: number
    source: number
    sourceId: number
    name: number
    handle: number
    productIds: number
    rawCategory: number
    importedAt: number
    createdAt: number
    _all: number
  }


  export type PricepallyCategoryMinAggregateInputType = {
    id?: true
    source?: true
    sourceId?: true
    name?: true
    handle?: true
    importedAt?: true
    createdAt?: true
  }

  export type PricepallyCategoryMaxAggregateInputType = {
    id?: true
    source?: true
    sourceId?: true
    name?: true
    handle?: true
    importedAt?: true
    createdAt?: true
  }

  export type PricepallyCategoryCountAggregateInputType = {
    id?: true
    source?: true
    sourceId?: true
    name?: true
    handle?: true
    productIds?: true
    rawCategory?: true
    importedAt?: true
    createdAt?: true
    _all?: true
  }

  export type PricepallyCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PricepallyCategory to aggregate.
     */
    where?: PricepallyCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyCategories to fetch.
     */
    orderBy?: PricepallyCategoryOrderByWithRelationInput | PricepallyCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PricepallyCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PricepallyCategories
    **/
    _count?: true | PricepallyCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PricepallyCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PricepallyCategoryMaxAggregateInputType
  }

  export type GetPricepallyCategoryAggregateType<T extends PricepallyCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregatePricepallyCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePricepallyCategory[P]>
      : GetScalarType<T[P], AggregatePricepallyCategory[P]>
  }




  export type PricepallyCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PricepallyCategoryWhereInput
    orderBy?: PricepallyCategoryOrderByWithAggregationInput | PricepallyCategoryOrderByWithAggregationInput[]
    by: PricepallyCategoryScalarFieldEnum[] | PricepallyCategoryScalarFieldEnum
    having?: PricepallyCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PricepallyCategoryCountAggregateInputType | true
    _min?: PricepallyCategoryMinAggregateInputType
    _max?: PricepallyCategoryMaxAggregateInputType
  }

  export type PricepallyCategoryGroupByOutputType = {
    id: string
    source: string
    sourceId: string | null
    name: string
    handle: string
    productIds: string[]
    rawCategory: JsonValue
    importedAt: Date
    createdAt: Date
    _count: PricepallyCategoryCountAggregateOutputType | null
    _min: PricepallyCategoryMinAggregateOutputType | null
    _max: PricepallyCategoryMaxAggregateOutputType | null
  }

  type GetPricepallyCategoryGroupByPayload<T extends PricepallyCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PricepallyCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PricepallyCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PricepallyCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], PricepallyCategoryGroupByOutputType[P]>
        }
      >
    >


  export type PricepallyCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    sourceId?: boolean
    name?: boolean
    handle?: boolean
    productIds?: boolean
    rawCategory?: boolean
    importedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["pricepallyCategory"]>



  export type PricepallyCategorySelectScalar = {
    id?: boolean
    source?: boolean
    sourceId?: boolean
    name?: boolean
    handle?: boolean
    productIds?: boolean
    rawCategory?: boolean
    importedAt?: boolean
    createdAt?: boolean
  }

  export type PricepallyCategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "sourceId" | "name" | "handle" | "productIds" | "rawCategory" | "importedAt" | "createdAt", ExtArgs["result"]["pricepallyCategory"]>

  export type $PricepallyCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PricepallyCategory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      source: string
      sourceId: string | null
      name: string
      handle: string
      productIds: string[]
      rawCategory: Prisma.JsonValue
      importedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["pricepallyCategory"]>
    composites: {}
  }

  type PricepallyCategoryGetPayload<S extends boolean | null | undefined | PricepallyCategoryDefaultArgs> = $Result.GetResult<Prisma.$PricepallyCategoryPayload, S>

  type PricepallyCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PricepallyCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PricepallyCategoryCountAggregateInputType | true
    }

  export interface PricepallyCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PricepallyCategory'], meta: { name: 'PricepallyCategory' } }
    /**
     * Find zero or one PricepallyCategory that matches the filter.
     * @param {PricepallyCategoryFindUniqueArgs} args - Arguments to find a PricepallyCategory
     * @example
     * // Get one PricepallyCategory
     * const pricepallyCategory = await prisma.pricepallyCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PricepallyCategoryFindUniqueArgs>(args: SelectSubset<T, PricepallyCategoryFindUniqueArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PricepallyCategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PricepallyCategoryFindUniqueOrThrowArgs} args - Arguments to find a PricepallyCategory
     * @example
     * // Get one PricepallyCategory
     * const pricepallyCategory = await prisma.pricepallyCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PricepallyCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, PricepallyCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PricepallyCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryFindFirstArgs} args - Arguments to find a PricepallyCategory
     * @example
     * // Get one PricepallyCategory
     * const pricepallyCategory = await prisma.pricepallyCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PricepallyCategoryFindFirstArgs>(args?: SelectSubset<T, PricepallyCategoryFindFirstArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PricepallyCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryFindFirstOrThrowArgs} args - Arguments to find a PricepallyCategory
     * @example
     * // Get one PricepallyCategory
     * const pricepallyCategory = await prisma.pricepallyCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PricepallyCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, PricepallyCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PricepallyCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PricepallyCategories
     * const pricepallyCategories = await prisma.pricepallyCategory.findMany()
     * 
     * // Get first 10 PricepallyCategories
     * const pricepallyCategories = await prisma.pricepallyCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pricepallyCategoryWithIdOnly = await prisma.pricepallyCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PricepallyCategoryFindManyArgs>(args?: SelectSubset<T, PricepallyCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PricepallyCategory.
     * @param {PricepallyCategoryCreateArgs} args - Arguments to create a PricepallyCategory.
     * @example
     * // Create one PricepallyCategory
     * const PricepallyCategory = await prisma.pricepallyCategory.create({
     *   data: {
     *     // ... data to create a PricepallyCategory
     *   }
     * })
     * 
     */
    create<T extends PricepallyCategoryCreateArgs>(args: SelectSubset<T, PricepallyCategoryCreateArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PricepallyCategories.
     * @param {PricepallyCategoryCreateManyArgs} args - Arguments to create many PricepallyCategories.
     * @example
     * // Create many PricepallyCategories
     * const pricepallyCategory = await prisma.pricepallyCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PricepallyCategoryCreateManyArgs>(args?: SelectSubset<T, PricepallyCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PricepallyCategory.
     * @param {PricepallyCategoryDeleteArgs} args - Arguments to delete one PricepallyCategory.
     * @example
     * // Delete one PricepallyCategory
     * const PricepallyCategory = await prisma.pricepallyCategory.delete({
     *   where: {
     *     // ... filter to delete one PricepallyCategory
     *   }
     * })
     * 
     */
    delete<T extends PricepallyCategoryDeleteArgs>(args: SelectSubset<T, PricepallyCategoryDeleteArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PricepallyCategory.
     * @param {PricepallyCategoryUpdateArgs} args - Arguments to update one PricepallyCategory.
     * @example
     * // Update one PricepallyCategory
     * const pricepallyCategory = await prisma.pricepallyCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PricepallyCategoryUpdateArgs>(args: SelectSubset<T, PricepallyCategoryUpdateArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PricepallyCategories.
     * @param {PricepallyCategoryDeleteManyArgs} args - Arguments to filter PricepallyCategories to delete.
     * @example
     * // Delete a few PricepallyCategories
     * const { count } = await prisma.pricepallyCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PricepallyCategoryDeleteManyArgs>(args?: SelectSubset<T, PricepallyCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PricepallyCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PricepallyCategories
     * const pricepallyCategory = await prisma.pricepallyCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PricepallyCategoryUpdateManyArgs>(args: SelectSubset<T, PricepallyCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PricepallyCategory.
     * @param {PricepallyCategoryUpsertArgs} args - Arguments to update or create a PricepallyCategory.
     * @example
     * // Update or create a PricepallyCategory
     * const pricepallyCategory = await prisma.pricepallyCategory.upsert({
     *   create: {
     *     // ... data to create a PricepallyCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PricepallyCategory we want to update
     *   }
     * })
     */
    upsert<T extends PricepallyCategoryUpsertArgs>(args: SelectSubset<T, PricepallyCategoryUpsertArgs<ExtArgs>>): Prisma__PricepallyCategoryClient<$Result.GetResult<Prisma.$PricepallyCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PricepallyCategories that matches the filter.
     * @param {PricepallyCategoryFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const pricepallyCategory = await prisma.pricepallyCategory.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: PricepallyCategoryFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a PricepallyCategory.
     * @param {PricepallyCategoryAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const pricepallyCategory = await prisma.pricepallyCategory.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: PricepallyCategoryAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of PricepallyCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryCountArgs} args - Arguments to filter PricepallyCategories to count.
     * @example
     * // Count the number of PricepallyCategories
     * const count = await prisma.pricepallyCategory.count({
     *   where: {
     *     // ... the filter for the PricepallyCategories we want to count
     *   }
     * })
    **/
    count<T extends PricepallyCategoryCountArgs>(
      args?: Subset<T, PricepallyCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PricepallyCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PricepallyCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PricepallyCategoryAggregateArgs>(args: Subset<T, PricepallyCategoryAggregateArgs>): Prisma.PrismaPromise<GetPricepallyCategoryAggregateType<T>>

    /**
     * Group by PricepallyCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricepallyCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PricepallyCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PricepallyCategoryGroupByArgs['orderBy'] }
        : { orderBy?: PricepallyCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PricepallyCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPricepallyCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PricepallyCategory model
   */
  readonly fields: PricepallyCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PricepallyCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PricepallyCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PricepallyCategory model
   */
  interface PricepallyCategoryFieldRefs {
    readonly id: FieldRef<"PricepallyCategory", 'String'>
    readonly source: FieldRef<"PricepallyCategory", 'String'>
    readonly sourceId: FieldRef<"PricepallyCategory", 'String'>
    readonly name: FieldRef<"PricepallyCategory", 'String'>
    readonly handle: FieldRef<"PricepallyCategory", 'String'>
    readonly productIds: FieldRef<"PricepallyCategory", 'String[]'>
    readonly rawCategory: FieldRef<"PricepallyCategory", 'Json'>
    readonly importedAt: FieldRef<"PricepallyCategory", 'DateTime'>
    readonly createdAt: FieldRef<"PricepallyCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PricepallyCategory findUnique
   */
  export type PricepallyCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyCategory to fetch.
     */
    where: PricepallyCategoryWhereUniqueInput
  }

  /**
   * PricepallyCategory findUniqueOrThrow
   */
  export type PricepallyCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyCategory to fetch.
     */
    where: PricepallyCategoryWhereUniqueInput
  }

  /**
   * PricepallyCategory findFirst
   */
  export type PricepallyCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyCategory to fetch.
     */
    where?: PricepallyCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyCategories to fetch.
     */
    orderBy?: PricepallyCategoryOrderByWithRelationInput | PricepallyCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PricepallyCategories.
     */
    cursor?: PricepallyCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PricepallyCategories.
     */
    distinct?: PricepallyCategoryScalarFieldEnum | PricepallyCategoryScalarFieldEnum[]
  }

  /**
   * PricepallyCategory findFirstOrThrow
   */
  export type PricepallyCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyCategory to fetch.
     */
    where?: PricepallyCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyCategories to fetch.
     */
    orderBy?: PricepallyCategoryOrderByWithRelationInput | PricepallyCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PricepallyCategories.
     */
    cursor?: PricepallyCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PricepallyCategories.
     */
    distinct?: PricepallyCategoryScalarFieldEnum | PricepallyCategoryScalarFieldEnum[]
  }

  /**
   * PricepallyCategory findMany
   */
  export type PricepallyCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * Filter, which PricepallyCategories to fetch.
     */
    where?: PricepallyCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricepallyCategories to fetch.
     */
    orderBy?: PricepallyCategoryOrderByWithRelationInput | PricepallyCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PricepallyCategories.
     */
    cursor?: PricepallyCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricepallyCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricepallyCategories.
     */
    skip?: number
    distinct?: PricepallyCategoryScalarFieldEnum | PricepallyCategoryScalarFieldEnum[]
  }

  /**
   * PricepallyCategory create
   */
  export type PricepallyCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * The data needed to create a PricepallyCategory.
     */
    data: XOR<PricepallyCategoryCreateInput, PricepallyCategoryUncheckedCreateInput>
  }

  /**
   * PricepallyCategory createMany
   */
  export type PricepallyCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PricepallyCategories.
     */
    data: PricepallyCategoryCreateManyInput | PricepallyCategoryCreateManyInput[]
  }

  /**
   * PricepallyCategory update
   */
  export type PricepallyCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * The data needed to update a PricepallyCategory.
     */
    data: XOR<PricepallyCategoryUpdateInput, PricepallyCategoryUncheckedUpdateInput>
    /**
     * Choose, which PricepallyCategory to update.
     */
    where: PricepallyCategoryWhereUniqueInput
  }

  /**
   * PricepallyCategory updateMany
   */
  export type PricepallyCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PricepallyCategories.
     */
    data: XOR<PricepallyCategoryUpdateManyMutationInput, PricepallyCategoryUncheckedUpdateManyInput>
    /**
     * Filter which PricepallyCategories to update
     */
    where?: PricepallyCategoryWhereInput
    /**
     * Limit how many PricepallyCategories to update.
     */
    limit?: number
  }

  /**
   * PricepallyCategory upsert
   */
  export type PricepallyCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * The filter to search for the PricepallyCategory to update in case it exists.
     */
    where: PricepallyCategoryWhereUniqueInput
    /**
     * In case the PricepallyCategory found by the `where` argument doesn't exist, create a new PricepallyCategory with this data.
     */
    create: XOR<PricepallyCategoryCreateInput, PricepallyCategoryUncheckedCreateInput>
    /**
     * In case the PricepallyCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PricepallyCategoryUpdateInput, PricepallyCategoryUncheckedUpdateInput>
  }

  /**
   * PricepallyCategory delete
   */
  export type PricepallyCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
    /**
     * Filter which PricepallyCategory to delete.
     */
    where: PricepallyCategoryWhereUniqueInput
  }

  /**
   * PricepallyCategory deleteMany
   */
  export type PricepallyCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PricepallyCategories to delete
     */
    where?: PricepallyCategoryWhereInput
    /**
     * Limit how many PricepallyCategories to delete.
     */
    limit?: number
  }

  /**
   * PricepallyCategory findRaw
   */
  export type PricepallyCategoryFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PricepallyCategory aggregateRaw
   */
  export type PricepallyCategoryAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * PricepallyCategory without action
   */
  export type PricepallyCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricepallyCategory
     */
    select?: PricepallyCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the PricepallyCategory
     */
    omit?: PricepallyCategoryOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const PricepallyProductScalarFieldEnum: {
    id: 'id',
    source: 'source',
    sourceUrl: 'sourceUrl',
    sourceId: 'sourceId',
    handle: 'handle',
    title: 'title',
    description: 'description',
    images: 'images',
    categoryRefs: 'categoryRefs',
    rawProduct: 'rawProduct',
    importedAt: 'importedAt',
    createdAt: 'createdAt'
  };

  export type PricepallyProductScalarFieldEnum = (typeof PricepallyProductScalarFieldEnum)[keyof typeof PricepallyProductScalarFieldEnum]


  export const PricepallyCategoryScalarFieldEnum: {
    id: 'id',
    source: 'source',
    sourceId: 'sourceId',
    name: 'name',
    handle: 'handle',
    productIds: 'productIds',
    rawCategory: 'rawCategory',
    importedAt: 'importedAt',
    createdAt: 'createdAt'
  };

  export type PricepallyCategoryScalarFieldEnum = (typeof PricepallyCategoryScalarFieldEnum)[keyof typeof PricepallyCategoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type PricepallyProductWhereInput = {
    AND?: PricepallyProductWhereInput | PricepallyProductWhereInput[]
    OR?: PricepallyProductWhereInput[]
    NOT?: PricepallyProductWhereInput | PricepallyProductWhereInput[]
    id?: StringFilter<"PricepallyProduct"> | string
    source?: StringFilter<"PricepallyProduct"> | string
    sourceUrl?: StringFilter<"PricepallyProduct"> | string
    sourceId?: StringFilter<"PricepallyProduct"> | string
    handle?: StringNullableFilter<"PricepallyProduct"> | string | null
    title?: StringNullableFilter<"PricepallyProduct"> | string | null
    description?: StringNullableFilter<"PricepallyProduct"> | string | null
    images?: JsonFilter<"PricepallyProduct">
    categoryRefs?: JsonFilter<"PricepallyProduct">
    rawProduct?: JsonFilter<"PricepallyProduct">
    importedAt?: DateTimeFilter<"PricepallyProduct"> | Date | string
    createdAt?: DateTimeFilter<"PricepallyProduct"> | Date | string
  }

  export type PricepallyProductOrderByWithRelationInput = {
    id?: SortOrder
    source?: SortOrder
    sourceUrl?: SortOrder
    sourceId?: SortOrder
    handle?: SortOrder
    title?: SortOrder
    description?: SortOrder
    images?: SortOrder
    categoryRefs?: SortOrder
    rawProduct?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PricepallyProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sourceId?: string
    AND?: PricepallyProductWhereInput | PricepallyProductWhereInput[]
    OR?: PricepallyProductWhereInput[]
    NOT?: PricepallyProductWhereInput | PricepallyProductWhereInput[]
    source?: StringFilter<"PricepallyProduct"> | string
    sourceUrl?: StringFilter<"PricepallyProduct"> | string
    handle?: StringNullableFilter<"PricepallyProduct"> | string | null
    title?: StringNullableFilter<"PricepallyProduct"> | string | null
    description?: StringNullableFilter<"PricepallyProduct"> | string | null
    images?: JsonFilter<"PricepallyProduct">
    categoryRefs?: JsonFilter<"PricepallyProduct">
    rawProduct?: JsonFilter<"PricepallyProduct">
    importedAt?: DateTimeFilter<"PricepallyProduct"> | Date | string
    createdAt?: DateTimeFilter<"PricepallyProduct"> | Date | string
  }, "id" | "sourceId">

  export type PricepallyProductOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    sourceUrl?: SortOrder
    sourceId?: SortOrder
    handle?: SortOrder
    title?: SortOrder
    description?: SortOrder
    images?: SortOrder
    categoryRefs?: SortOrder
    rawProduct?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
    _count?: PricepallyProductCountOrderByAggregateInput
    _max?: PricepallyProductMaxOrderByAggregateInput
    _min?: PricepallyProductMinOrderByAggregateInput
  }

  export type PricepallyProductScalarWhereWithAggregatesInput = {
    AND?: PricepallyProductScalarWhereWithAggregatesInput | PricepallyProductScalarWhereWithAggregatesInput[]
    OR?: PricepallyProductScalarWhereWithAggregatesInput[]
    NOT?: PricepallyProductScalarWhereWithAggregatesInput | PricepallyProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PricepallyProduct"> | string
    source?: StringWithAggregatesFilter<"PricepallyProduct"> | string
    sourceUrl?: StringWithAggregatesFilter<"PricepallyProduct"> | string
    sourceId?: StringWithAggregatesFilter<"PricepallyProduct"> | string
    handle?: StringNullableWithAggregatesFilter<"PricepallyProduct"> | string | null
    title?: StringNullableWithAggregatesFilter<"PricepallyProduct"> | string | null
    description?: StringNullableWithAggregatesFilter<"PricepallyProduct"> | string | null
    images?: JsonWithAggregatesFilter<"PricepallyProduct">
    categoryRefs?: JsonWithAggregatesFilter<"PricepallyProduct">
    rawProduct?: JsonWithAggregatesFilter<"PricepallyProduct">
    importedAt?: DateTimeWithAggregatesFilter<"PricepallyProduct"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"PricepallyProduct"> | Date | string
  }

  export type PricepallyCategoryWhereInput = {
    AND?: PricepallyCategoryWhereInput | PricepallyCategoryWhereInput[]
    OR?: PricepallyCategoryWhereInput[]
    NOT?: PricepallyCategoryWhereInput | PricepallyCategoryWhereInput[]
    id?: StringFilter<"PricepallyCategory"> | string
    source?: StringFilter<"PricepallyCategory"> | string
    sourceId?: StringNullableFilter<"PricepallyCategory"> | string | null
    name?: StringFilter<"PricepallyCategory"> | string
    handle?: StringFilter<"PricepallyCategory"> | string
    productIds?: StringNullableListFilter<"PricepallyCategory">
    rawCategory?: JsonFilter<"PricepallyCategory">
    importedAt?: DateTimeFilter<"PricepallyCategory"> | Date | string
    createdAt?: DateTimeFilter<"PricepallyCategory"> | Date | string
  }

  export type PricepallyCategoryOrderByWithRelationInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    productIds?: SortOrder
    rawCategory?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PricepallyCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    handle?: string
    AND?: PricepallyCategoryWhereInput | PricepallyCategoryWhereInput[]
    OR?: PricepallyCategoryWhereInput[]
    NOT?: PricepallyCategoryWhereInput | PricepallyCategoryWhereInput[]
    source?: StringFilter<"PricepallyCategory"> | string
    sourceId?: StringNullableFilter<"PricepallyCategory"> | string | null
    name?: StringFilter<"PricepallyCategory"> | string
    productIds?: StringNullableListFilter<"PricepallyCategory">
    rawCategory?: JsonFilter<"PricepallyCategory">
    importedAt?: DateTimeFilter<"PricepallyCategory"> | Date | string
    createdAt?: DateTimeFilter<"PricepallyCategory"> | Date | string
  }, "id" | "handle">

  export type PricepallyCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    productIds?: SortOrder
    rawCategory?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
    _count?: PricepallyCategoryCountOrderByAggregateInput
    _max?: PricepallyCategoryMaxOrderByAggregateInput
    _min?: PricepallyCategoryMinOrderByAggregateInput
  }

  export type PricepallyCategoryScalarWhereWithAggregatesInput = {
    AND?: PricepallyCategoryScalarWhereWithAggregatesInput | PricepallyCategoryScalarWhereWithAggregatesInput[]
    OR?: PricepallyCategoryScalarWhereWithAggregatesInput[]
    NOT?: PricepallyCategoryScalarWhereWithAggregatesInput | PricepallyCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PricepallyCategory"> | string
    source?: StringWithAggregatesFilter<"PricepallyCategory"> | string
    sourceId?: StringNullableWithAggregatesFilter<"PricepallyCategory"> | string | null
    name?: StringWithAggregatesFilter<"PricepallyCategory"> | string
    handle?: StringWithAggregatesFilter<"PricepallyCategory"> | string
    productIds?: StringNullableListFilter<"PricepallyCategory">
    rawCategory?: JsonWithAggregatesFilter<"PricepallyCategory">
    importedAt?: DateTimeWithAggregatesFilter<"PricepallyCategory"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"PricepallyCategory"> | Date | string
  }

  export type PricepallyProductCreateInput = {
    id: string
    source: string
    sourceUrl: string
    sourceId: string
    handle?: string | null
    title?: string | null
    description?: string | null
    images: InputJsonValue
    categoryRefs: InputJsonValue
    rawProduct: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type PricepallyProductUncheckedCreateInput = {
    id: string
    source: string
    sourceUrl: string
    sourceId: string
    handle?: string | null
    title?: string | null
    description?: string | null
    images: InputJsonValue
    categoryRefs: InputJsonValue
    rawProduct: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type PricepallyProductUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    sourceId?: StringFieldUpdateOperationsInput | string
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    images?: InputJsonValue | InputJsonValue
    categoryRefs?: InputJsonValue | InputJsonValue
    rawProduct?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyProductUncheckedUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    sourceId?: StringFieldUpdateOperationsInput | string
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    images?: InputJsonValue | InputJsonValue
    categoryRefs?: InputJsonValue | InputJsonValue
    rawProduct?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyProductCreateManyInput = {
    id: string
    source: string
    sourceUrl: string
    sourceId: string
    handle?: string | null
    title?: string | null
    description?: string | null
    images: InputJsonValue
    categoryRefs: InputJsonValue
    rawProduct: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type PricepallyProductUpdateManyMutationInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    sourceId?: StringFieldUpdateOperationsInput | string
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    images?: InputJsonValue | InputJsonValue
    categoryRefs?: InputJsonValue | InputJsonValue
    rawProduct?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyProductUncheckedUpdateManyInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceUrl?: StringFieldUpdateOperationsInput | string
    sourceId?: StringFieldUpdateOperationsInput | string
    handle?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    images?: InputJsonValue | InputJsonValue
    categoryRefs?: InputJsonValue | InputJsonValue
    rawProduct?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyCategoryCreateInput = {
    id: string
    source: string
    sourceId?: string | null
    name: string
    handle: string
    productIds?: PricepallyCategoryCreateproductIdsInput | string[]
    rawCategory: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type PricepallyCategoryUncheckedCreateInput = {
    id: string
    source: string
    sourceId?: string | null
    name: string
    handle: string
    productIds?: PricepallyCategoryCreateproductIdsInput | string[]
    rawCategory: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type PricepallyCategoryUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: PricepallyCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyCategoryUncheckedUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: PricepallyCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyCategoryCreateManyInput = {
    id: string
    source: string
    sourceId?: string | null
    name: string
    handle: string
    productIds?: PricepallyCategoryCreateproductIdsInput | string[]
    rawCategory: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type PricepallyCategoryUpdateManyMutationInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: PricepallyCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricepallyCategoryUncheckedUpdateManyInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: PricepallyCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PricepallyProductCountOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceUrl?: SortOrder
    sourceId?: SortOrder
    handle?: SortOrder
    title?: SortOrder
    description?: SortOrder
    images?: SortOrder
    categoryRefs?: SortOrder
    rawProduct?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PricepallyProductMaxOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceUrl?: SortOrder
    sourceId?: SortOrder
    handle?: SortOrder
    title?: SortOrder
    description?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PricepallyProductMinOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceUrl?: SortOrder
    sourceId?: SortOrder
    handle?: SortOrder
    title?: SortOrder
    description?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type PricepallyCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    productIds?: SortOrder
    rawCategory?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PricepallyCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PricepallyCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
    unset?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PricepallyCategoryCreateproductIdsInput = {
    set: string[]
  }

  export type PricepallyCategoryUpdateproductIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
    isSet?: boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
    isSet?: boolean
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
    isSet?: boolean
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}