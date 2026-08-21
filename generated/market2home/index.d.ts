
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
 * Model Market2homeProduct
 * 
 */
export type Market2homeProduct = $Result.DefaultSelection<Prisma.$Market2homeProductPayload>
/**
 * Model Market2homeCategory
 * 
 */
export type Market2homeCategory = $Result.DefaultSelection<Prisma.$Market2homeCategoryPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Market2homeProducts
 * const market2homeProducts = await prisma.market2homeProduct.findMany()
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
   * // Fetch zero or more Market2homeProducts
   * const market2homeProducts = await prisma.market2homeProduct.findMany()
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
   * `prisma.market2homeProduct`: Exposes CRUD operations for the **Market2homeProduct** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Market2homeProducts
    * const market2homeProducts = await prisma.market2homeProduct.findMany()
    * ```
    */
  get market2homeProduct(): Prisma.Market2homeProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.market2homeCategory`: Exposes CRUD operations for the **Market2homeCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Market2homeCategories
    * const market2homeCategories = await prisma.market2homeCategory.findMany()
    * ```
    */
  get market2homeCategory(): Prisma.Market2homeCategoryDelegate<ExtArgs, ClientOptions>;
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
    Market2homeProduct: 'Market2homeProduct',
    Market2homeCategory: 'Market2homeCategory'
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
      modelProps: "market2homeProduct" | "market2homeCategory"
      txIsolationLevel: never
    }
    model: {
      Market2homeProduct: {
        payload: Prisma.$Market2homeProductPayload<ExtArgs>
        fields: Prisma.Market2homeProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.Market2homeProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.Market2homeProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>
          }
          findFirst: {
            args: Prisma.Market2homeProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.Market2homeProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>
          }
          findMany: {
            args: Prisma.Market2homeProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>[]
          }
          create: {
            args: Prisma.Market2homeProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>
          }
          createMany: {
            args: Prisma.Market2homeProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.Market2homeProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>
          }
          update: {
            args: Prisma.Market2homeProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>
          }
          deleteMany: {
            args: Prisma.Market2homeProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.Market2homeProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.Market2homeProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeProductPayload>
          }
          aggregate: {
            args: Prisma.Market2homeProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarket2homeProduct>
          }
          groupBy: {
            args: Prisma.Market2homeProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<Market2homeProductGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.Market2homeProductFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.Market2homeProductAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.Market2homeProductCountArgs<ExtArgs>
            result: $Utils.Optional<Market2homeProductCountAggregateOutputType> | number
          }
        }
      }
      Market2homeCategory: {
        payload: Prisma.$Market2homeCategoryPayload<ExtArgs>
        fields: Prisma.Market2homeCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.Market2homeCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.Market2homeCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>
          }
          findFirst: {
            args: Prisma.Market2homeCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.Market2homeCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>
          }
          findMany: {
            args: Prisma.Market2homeCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>[]
          }
          create: {
            args: Prisma.Market2homeCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>
          }
          createMany: {
            args: Prisma.Market2homeCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.Market2homeCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>
          }
          update: {
            args: Prisma.Market2homeCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>
          }
          deleteMany: {
            args: Prisma.Market2homeCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.Market2homeCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.Market2homeCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$Market2homeCategoryPayload>
          }
          aggregate: {
            args: Prisma.Market2homeCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarket2homeCategory>
          }
          groupBy: {
            args: Prisma.Market2homeCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<Market2homeCategoryGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.Market2homeCategoryFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.Market2homeCategoryAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.Market2homeCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<Market2homeCategoryCountAggregateOutputType> | number
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
    market2homeProduct?: Market2homeProductOmit
    market2homeCategory?: Market2homeCategoryOmit
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
   * Model Market2homeProduct
   */

  export type AggregateMarket2homeProduct = {
    _count: Market2homeProductCountAggregateOutputType | null
    _min: Market2homeProductMinAggregateOutputType | null
    _max: Market2homeProductMaxAggregateOutputType | null
  }

  export type Market2homeProductMinAggregateOutputType = {
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

  export type Market2homeProductMaxAggregateOutputType = {
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

  export type Market2homeProductCountAggregateOutputType = {
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


  export type Market2homeProductMinAggregateInputType = {
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

  export type Market2homeProductMaxAggregateInputType = {
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

  export type Market2homeProductCountAggregateInputType = {
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

  export type Market2homeProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Market2homeProduct to aggregate.
     */
    where?: Market2homeProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeProducts to fetch.
     */
    orderBy?: Market2homeProductOrderByWithRelationInput | Market2homeProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: Market2homeProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Market2homeProducts
    **/
    _count?: true | Market2homeProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Market2homeProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Market2homeProductMaxAggregateInputType
  }

  export type GetMarket2homeProductAggregateType<T extends Market2homeProductAggregateArgs> = {
        [P in keyof T & keyof AggregateMarket2homeProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarket2homeProduct[P]>
      : GetScalarType<T[P], AggregateMarket2homeProduct[P]>
  }




  export type Market2homeProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: Market2homeProductWhereInput
    orderBy?: Market2homeProductOrderByWithAggregationInput | Market2homeProductOrderByWithAggregationInput[]
    by: Market2homeProductScalarFieldEnum[] | Market2homeProductScalarFieldEnum
    having?: Market2homeProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Market2homeProductCountAggregateInputType | true
    _min?: Market2homeProductMinAggregateInputType
    _max?: Market2homeProductMaxAggregateInputType
  }

  export type Market2homeProductGroupByOutputType = {
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
    _count: Market2homeProductCountAggregateOutputType | null
    _min: Market2homeProductMinAggregateOutputType | null
    _max: Market2homeProductMaxAggregateOutputType | null
  }

  type GetMarket2homeProductGroupByPayload<T extends Market2homeProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Market2homeProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Market2homeProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Market2homeProductGroupByOutputType[P]>
            : GetScalarType<T[P], Market2homeProductGroupByOutputType[P]>
        }
      >
    >


  export type Market2homeProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["market2homeProduct"]>



  export type Market2homeProductSelectScalar = {
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

  export type Market2homeProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "sourceUrl" | "sourceId" | "handle" | "title" | "description" | "images" | "categoryRefs" | "rawProduct" | "importedAt" | "createdAt", ExtArgs["result"]["market2homeProduct"]>

  export type $Market2homeProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Market2homeProduct"
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
    }, ExtArgs["result"]["market2homeProduct"]>
    composites: {}
  }

  type Market2homeProductGetPayload<S extends boolean | null | undefined | Market2homeProductDefaultArgs> = $Result.GetResult<Prisma.$Market2homeProductPayload, S>

  type Market2homeProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<Market2homeProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Market2homeProductCountAggregateInputType | true
    }

  export interface Market2homeProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Market2homeProduct'], meta: { name: 'Market2homeProduct' } }
    /**
     * Find zero or one Market2homeProduct that matches the filter.
     * @param {Market2homeProductFindUniqueArgs} args - Arguments to find a Market2homeProduct
     * @example
     * // Get one Market2homeProduct
     * const market2homeProduct = await prisma.market2homeProduct.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends Market2homeProductFindUniqueArgs>(args: SelectSubset<T, Market2homeProductFindUniqueArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Market2homeProduct that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {Market2homeProductFindUniqueOrThrowArgs} args - Arguments to find a Market2homeProduct
     * @example
     * // Get one Market2homeProduct
     * const market2homeProduct = await prisma.market2homeProduct.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends Market2homeProductFindUniqueOrThrowArgs>(args: SelectSubset<T, Market2homeProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Market2homeProduct that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductFindFirstArgs} args - Arguments to find a Market2homeProduct
     * @example
     * // Get one Market2homeProduct
     * const market2homeProduct = await prisma.market2homeProduct.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends Market2homeProductFindFirstArgs>(args?: SelectSubset<T, Market2homeProductFindFirstArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Market2homeProduct that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductFindFirstOrThrowArgs} args - Arguments to find a Market2homeProduct
     * @example
     * // Get one Market2homeProduct
     * const market2homeProduct = await prisma.market2homeProduct.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends Market2homeProductFindFirstOrThrowArgs>(args?: SelectSubset<T, Market2homeProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Market2homeProducts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Market2homeProducts
     * const market2homeProducts = await prisma.market2homeProduct.findMany()
     * 
     * // Get first 10 Market2homeProducts
     * const market2homeProducts = await prisma.market2homeProduct.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const market2homeProductWithIdOnly = await prisma.market2homeProduct.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends Market2homeProductFindManyArgs>(args?: SelectSubset<T, Market2homeProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Market2homeProduct.
     * @param {Market2homeProductCreateArgs} args - Arguments to create a Market2homeProduct.
     * @example
     * // Create one Market2homeProduct
     * const Market2homeProduct = await prisma.market2homeProduct.create({
     *   data: {
     *     // ... data to create a Market2homeProduct
     *   }
     * })
     * 
     */
    create<T extends Market2homeProductCreateArgs>(args: SelectSubset<T, Market2homeProductCreateArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Market2homeProducts.
     * @param {Market2homeProductCreateManyArgs} args - Arguments to create many Market2homeProducts.
     * @example
     * // Create many Market2homeProducts
     * const market2homeProduct = await prisma.market2homeProduct.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends Market2homeProductCreateManyArgs>(args?: SelectSubset<T, Market2homeProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Market2homeProduct.
     * @param {Market2homeProductDeleteArgs} args - Arguments to delete one Market2homeProduct.
     * @example
     * // Delete one Market2homeProduct
     * const Market2homeProduct = await prisma.market2homeProduct.delete({
     *   where: {
     *     // ... filter to delete one Market2homeProduct
     *   }
     * })
     * 
     */
    delete<T extends Market2homeProductDeleteArgs>(args: SelectSubset<T, Market2homeProductDeleteArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Market2homeProduct.
     * @param {Market2homeProductUpdateArgs} args - Arguments to update one Market2homeProduct.
     * @example
     * // Update one Market2homeProduct
     * const market2homeProduct = await prisma.market2homeProduct.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends Market2homeProductUpdateArgs>(args: SelectSubset<T, Market2homeProductUpdateArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Market2homeProducts.
     * @param {Market2homeProductDeleteManyArgs} args - Arguments to filter Market2homeProducts to delete.
     * @example
     * // Delete a few Market2homeProducts
     * const { count } = await prisma.market2homeProduct.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends Market2homeProductDeleteManyArgs>(args?: SelectSubset<T, Market2homeProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Market2homeProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Market2homeProducts
     * const market2homeProduct = await prisma.market2homeProduct.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends Market2homeProductUpdateManyArgs>(args: SelectSubset<T, Market2homeProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Market2homeProduct.
     * @param {Market2homeProductUpsertArgs} args - Arguments to update or create a Market2homeProduct.
     * @example
     * // Update or create a Market2homeProduct
     * const market2homeProduct = await prisma.market2homeProduct.upsert({
     *   create: {
     *     // ... data to create a Market2homeProduct
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Market2homeProduct we want to update
     *   }
     * })
     */
    upsert<T extends Market2homeProductUpsertArgs>(args: SelectSubset<T, Market2homeProductUpsertArgs<ExtArgs>>): Prisma__Market2homeProductClient<$Result.GetResult<Prisma.$Market2homeProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Market2homeProducts that matches the filter.
     * @param {Market2homeProductFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const market2homeProduct = await prisma.market2homeProduct.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: Market2homeProductFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Market2homeProduct.
     * @param {Market2homeProductAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const market2homeProduct = await prisma.market2homeProduct.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: Market2homeProductAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Market2homeProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductCountArgs} args - Arguments to filter Market2homeProducts to count.
     * @example
     * // Count the number of Market2homeProducts
     * const count = await prisma.market2homeProduct.count({
     *   where: {
     *     // ... the filter for the Market2homeProducts we want to count
     *   }
     * })
    **/
    count<T extends Market2homeProductCountArgs>(
      args?: Subset<T, Market2homeProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Market2homeProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Market2homeProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Market2homeProductAggregateArgs>(args: Subset<T, Market2homeProductAggregateArgs>): Prisma.PrismaPromise<GetMarket2homeProductAggregateType<T>>

    /**
     * Group by Market2homeProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeProductGroupByArgs} args - Group by arguments.
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
      T extends Market2homeProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: Market2homeProductGroupByArgs['orderBy'] }
        : { orderBy?: Market2homeProductGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, Market2homeProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarket2homeProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Market2homeProduct model
   */
  readonly fields: Market2homeProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Market2homeProduct.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__Market2homeProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Market2homeProduct model
   */
  interface Market2homeProductFieldRefs {
    readonly id: FieldRef<"Market2homeProduct", 'String'>
    readonly source: FieldRef<"Market2homeProduct", 'String'>
    readonly sourceUrl: FieldRef<"Market2homeProduct", 'String'>
    readonly sourceId: FieldRef<"Market2homeProduct", 'String'>
    readonly handle: FieldRef<"Market2homeProduct", 'String'>
    readonly title: FieldRef<"Market2homeProduct", 'String'>
    readonly description: FieldRef<"Market2homeProduct", 'String'>
    readonly images: FieldRef<"Market2homeProduct", 'Json'>
    readonly categoryRefs: FieldRef<"Market2homeProduct", 'Json'>
    readonly rawProduct: FieldRef<"Market2homeProduct", 'Json'>
    readonly importedAt: FieldRef<"Market2homeProduct", 'DateTime'>
    readonly createdAt: FieldRef<"Market2homeProduct", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Market2homeProduct findUnique
   */
  export type Market2homeProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeProduct to fetch.
     */
    where: Market2homeProductWhereUniqueInput
  }

  /**
   * Market2homeProduct findUniqueOrThrow
   */
  export type Market2homeProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeProduct to fetch.
     */
    where: Market2homeProductWhereUniqueInput
  }

  /**
   * Market2homeProduct findFirst
   */
  export type Market2homeProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeProduct to fetch.
     */
    where?: Market2homeProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeProducts to fetch.
     */
    orderBy?: Market2homeProductOrderByWithRelationInput | Market2homeProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Market2homeProducts.
     */
    cursor?: Market2homeProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Market2homeProducts.
     */
    distinct?: Market2homeProductScalarFieldEnum | Market2homeProductScalarFieldEnum[]
  }

  /**
   * Market2homeProduct findFirstOrThrow
   */
  export type Market2homeProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeProduct to fetch.
     */
    where?: Market2homeProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeProducts to fetch.
     */
    orderBy?: Market2homeProductOrderByWithRelationInput | Market2homeProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Market2homeProducts.
     */
    cursor?: Market2homeProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Market2homeProducts.
     */
    distinct?: Market2homeProductScalarFieldEnum | Market2homeProductScalarFieldEnum[]
  }

  /**
   * Market2homeProduct findMany
   */
  export type Market2homeProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeProducts to fetch.
     */
    where?: Market2homeProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeProducts to fetch.
     */
    orderBy?: Market2homeProductOrderByWithRelationInput | Market2homeProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Market2homeProducts.
     */
    cursor?: Market2homeProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeProducts.
     */
    skip?: number
    distinct?: Market2homeProductScalarFieldEnum | Market2homeProductScalarFieldEnum[]
  }

  /**
   * Market2homeProduct create
   */
  export type Market2homeProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * The data needed to create a Market2homeProduct.
     */
    data: XOR<Market2homeProductCreateInput, Market2homeProductUncheckedCreateInput>
  }

  /**
   * Market2homeProduct createMany
   */
  export type Market2homeProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Market2homeProducts.
     */
    data: Market2homeProductCreateManyInput | Market2homeProductCreateManyInput[]
  }

  /**
   * Market2homeProduct update
   */
  export type Market2homeProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * The data needed to update a Market2homeProduct.
     */
    data: XOR<Market2homeProductUpdateInput, Market2homeProductUncheckedUpdateInput>
    /**
     * Choose, which Market2homeProduct to update.
     */
    where: Market2homeProductWhereUniqueInput
  }

  /**
   * Market2homeProduct updateMany
   */
  export type Market2homeProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Market2homeProducts.
     */
    data: XOR<Market2homeProductUpdateManyMutationInput, Market2homeProductUncheckedUpdateManyInput>
    /**
     * Filter which Market2homeProducts to update
     */
    where?: Market2homeProductWhereInput
    /**
     * Limit how many Market2homeProducts to update.
     */
    limit?: number
  }

  /**
   * Market2homeProduct upsert
   */
  export type Market2homeProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * The filter to search for the Market2homeProduct to update in case it exists.
     */
    where: Market2homeProductWhereUniqueInput
    /**
     * In case the Market2homeProduct found by the `where` argument doesn't exist, create a new Market2homeProduct with this data.
     */
    create: XOR<Market2homeProductCreateInput, Market2homeProductUncheckedCreateInput>
    /**
     * In case the Market2homeProduct was found with the provided `where` argument, update it with this data.
     */
    update: XOR<Market2homeProductUpdateInput, Market2homeProductUncheckedUpdateInput>
  }

  /**
   * Market2homeProduct delete
   */
  export type Market2homeProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
    /**
     * Filter which Market2homeProduct to delete.
     */
    where: Market2homeProductWhereUniqueInput
  }

  /**
   * Market2homeProduct deleteMany
   */
  export type Market2homeProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Market2homeProducts to delete
     */
    where?: Market2homeProductWhereInput
    /**
     * Limit how many Market2homeProducts to delete.
     */
    limit?: number
  }

  /**
   * Market2homeProduct findRaw
   */
  export type Market2homeProductFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Market2homeProduct aggregateRaw
   */
  export type Market2homeProductAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Market2homeProduct without action
   */
  export type Market2homeProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeProduct
     */
    select?: Market2homeProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeProduct
     */
    omit?: Market2homeProductOmit<ExtArgs> | null
  }


  /**
   * Model Market2homeCategory
   */

  export type AggregateMarket2homeCategory = {
    _count: Market2homeCategoryCountAggregateOutputType | null
    _min: Market2homeCategoryMinAggregateOutputType | null
    _max: Market2homeCategoryMaxAggregateOutputType | null
  }

  export type Market2homeCategoryMinAggregateOutputType = {
    id: string | null
    source: string | null
    sourceId: string | null
    name: string | null
    handle: string | null
    importedAt: Date | null
    createdAt: Date | null
  }

  export type Market2homeCategoryMaxAggregateOutputType = {
    id: string | null
    source: string | null
    sourceId: string | null
    name: string | null
    handle: string | null
    importedAt: Date | null
    createdAt: Date | null
  }

  export type Market2homeCategoryCountAggregateOutputType = {
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


  export type Market2homeCategoryMinAggregateInputType = {
    id?: true
    source?: true
    sourceId?: true
    name?: true
    handle?: true
    importedAt?: true
    createdAt?: true
  }

  export type Market2homeCategoryMaxAggregateInputType = {
    id?: true
    source?: true
    sourceId?: true
    name?: true
    handle?: true
    importedAt?: true
    createdAt?: true
  }

  export type Market2homeCategoryCountAggregateInputType = {
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

  export type Market2homeCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Market2homeCategory to aggregate.
     */
    where?: Market2homeCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeCategories to fetch.
     */
    orderBy?: Market2homeCategoryOrderByWithRelationInput | Market2homeCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: Market2homeCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Market2homeCategories
    **/
    _count?: true | Market2homeCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Market2homeCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Market2homeCategoryMaxAggregateInputType
  }

  export type GetMarket2homeCategoryAggregateType<T extends Market2homeCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateMarket2homeCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarket2homeCategory[P]>
      : GetScalarType<T[P], AggregateMarket2homeCategory[P]>
  }




  export type Market2homeCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: Market2homeCategoryWhereInput
    orderBy?: Market2homeCategoryOrderByWithAggregationInput | Market2homeCategoryOrderByWithAggregationInput[]
    by: Market2homeCategoryScalarFieldEnum[] | Market2homeCategoryScalarFieldEnum
    having?: Market2homeCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Market2homeCategoryCountAggregateInputType | true
    _min?: Market2homeCategoryMinAggregateInputType
    _max?: Market2homeCategoryMaxAggregateInputType
  }

  export type Market2homeCategoryGroupByOutputType = {
    id: string
    source: string
    sourceId: string | null
    name: string
    handle: string
    productIds: string[]
    rawCategory: JsonValue
    importedAt: Date
    createdAt: Date
    _count: Market2homeCategoryCountAggregateOutputType | null
    _min: Market2homeCategoryMinAggregateOutputType | null
    _max: Market2homeCategoryMaxAggregateOutputType | null
  }

  type GetMarket2homeCategoryGroupByPayload<T extends Market2homeCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Market2homeCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Market2homeCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Market2homeCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], Market2homeCategoryGroupByOutputType[P]>
        }
      >
    >


  export type Market2homeCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    sourceId?: boolean
    name?: boolean
    handle?: boolean
    productIds?: boolean
    rawCategory?: boolean
    importedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["market2homeCategory"]>



  export type Market2homeCategorySelectScalar = {
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

  export type Market2homeCategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "sourceId" | "name" | "handle" | "productIds" | "rawCategory" | "importedAt" | "createdAt", ExtArgs["result"]["market2homeCategory"]>

  export type $Market2homeCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Market2homeCategory"
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
    }, ExtArgs["result"]["market2homeCategory"]>
    composites: {}
  }

  type Market2homeCategoryGetPayload<S extends boolean | null | undefined | Market2homeCategoryDefaultArgs> = $Result.GetResult<Prisma.$Market2homeCategoryPayload, S>

  type Market2homeCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<Market2homeCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Market2homeCategoryCountAggregateInputType | true
    }

  export interface Market2homeCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Market2homeCategory'], meta: { name: 'Market2homeCategory' } }
    /**
     * Find zero or one Market2homeCategory that matches the filter.
     * @param {Market2homeCategoryFindUniqueArgs} args - Arguments to find a Market2homeCategory
     * @example
     * // Get one Market2homeCategory
     * const market2homeCategory = await prisma.market2homeCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends Market2homeCategoryFindUniqueArgs>(args: SelectSubset<T, Market2homeCategoryFindUniqueArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Market2homeCategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {Market2homeCategoryFindUniqueOrThrowArgs} args - Arguments to find a Market2homeCategory
     * @example
     * // Get one Market2homeCategory
     * const market2homeCategory = await prisma.market2homeCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends Market2homeCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, Market2homeCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Market2homeCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryFindFirstArgs} args - Arguments to find a Market2homeCategory
     * @example
     * // Get one Market2homeCategory
     * const market2homeCategory = await prisma.market2homeCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends Market2homeCategoryFindFirstArgs>(args?: SelectSubset<T, Market2homeCategoryFindFirstArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Market2homeCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryFindFirstOrThrowArgs} args - Arguments to find a Market2homeCategory
     * @example
     * // Get one Market2homeCategory
     * const market2homeCategory = await prisma.market2homeCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends Market2homeCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, Market2homeCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Market2homeCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Market2homeCategories
     * const market2homeCategories = await prisma.market2homeCategory.findMany()
     * 
     * // Get first 10 Market2homeCategories
     * const market2homeCategories = await prisma.market2homeCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const market2homeCategoryWithIdOnly = await prisma.market2homeCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends Market2homeCategoryFindManyArgs>(args?: SelectSubset<T, Market2homeCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Market2homeCategory.
     * @param {Market2homeCategoryCreateArgs} args - Arguments to create a Market2homeCategory.
     * @example
     * // Create one Market2homeCategory
     * const Market2homeCategory = await prisma.market2homeCategory.create({
     *   data: {
     *     // ... data to create a Market2homeCategory
     *   }
     * })
     * 
     */
    create<T extends Market2homeCategoryCreateArgs>(args: SelectSubset<T, Market2homeCategoryCreateArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Market2homeCategories.
     * @param {Market2homeCategoryCreateManyArgs} args - Arguments to create many Market2homeCategories.
     * @example
     * // Create many Market2homeCategories
     * const market2homeCategory = await prisma.market2homeCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends Market2homeCategoryCreateManyArgs>(args?: SelectSubset<T, Market2homeCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Market2homeCategory.
     * @param {Market2homeCategoryDeleteArgs} args - Arguments to delete one Market2homeCategory.
     * @example
     * // Delete one Market2homeCategory
     * const Market2homeCategory = await prisma.market2homeCategory.delete({
     *   where: {
     *     // ... filter to delete one Market2homeCategory
     *   }
     * })
     * 
     */
    delete<T extends Market2homeCategoryDeleteArgs>(args: SelectSubset<T, Market2homeCategoryDeleteArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Market2homeCategory.
     * @param {Market2homeCategoryUpdateArgs} args - Arguments to update one Market2homeCategory.
     * @example
     * // Update one Market2homeCategory
     * const market2homeCategory = await prisma.market2homeCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends Market2homeCategoryUpdateArgs>(args: SelectSubset<T, Market2homeCategoryUpdateArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Market2homeCategories.
     * @param {Market2homeCategoryDeleteManyArgs} args - Arguments to filter Market2homeCategories to delete.
     * @example
     * // Delete a few Market2homeCategories
     * const { count } = await prisma.market2homeCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends Market2homeCategoryDeleteManyArgs>(args?: SelectSubset<T, Market2homeCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Market2homeCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Market2homeCategories
     * const market2homeCategory = await prisma.market2homeCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends Market2homeCategoryUpdateManyArgs>(args: SelectSubset<T, Market2homeCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Market2homeCategory.
     * @param {Market2homeCategoryUpsertArgs} args - Arguments to update or create a Market2homeCategory.
     * @example
     * // Update or create a Market2homeCategory
     * const market2homeCategory = await prisma.market2homeCategory.upsert({
     *   create: {
     *     // ... data to create a Market2homeCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Market2homeCategory we want to update
     *   }
     * })
     */
    upsert<T extends Market2homeCategoryUpsertArgs>(args: SelectSubset<T, Market2homeCategoryUpsertArgs<ExtArgs>>): Prisma__Market2homeCategoryClient<$Result.GetResult<Prisma.$Market2homeCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Market2homeCategories that matches the filter.
     * @param {Market2homeCategoryFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const market2homeCategory = await prisma.market2homeCategory.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: Market2homeCategoryFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a Market2homeCategory.
     * @param {Market2homeCategoryAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const market2homeCategory = await prisma.market2homeCategory.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: Market2homeCategoryAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of Market2homeCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryCountArgs} args - Arguments to filter Market2homeCategories to count.
     * @example
     * // Count the number of Market2homeCategories
     * const count = await prisma.market2homeCategory.count({
     *   where: {
     *     // ... the filter for the Market2homeCategories we want to count
     *   }
     * })
    **/
    count<T extends Market2homeCategoryCountArgs>(
      args?: Subset<T, Market2homeCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Market2homeCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Market2homeCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Market2homeCategoryAggregateArgs>(args: Subset<T, Market2homeCategoryAggregateArgs>): Prisma.PrismaPromise<GetMarket2homeCategoryAggregateType<T>>

    /**
     * Group by Market2homeCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Market2homeCategoryGroupByArgs} args - Group by arguments.
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
      T extends Market2homeCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: Market2homeCategoryGroupByArgs['orderBy'] }
        : { orderBy?: Market2homeCategoryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, Market2homeCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarket2homeCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Market2homeCategory model
   */
  readonly fields: Market2homeCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Market2homeCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__Market2homeCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the Market2homeCategory model
   */
  interface Market2homeCategoryFieldRefs {
    readonly id: FieldRef<"Market2homeCategory", 'String'>
    readonly source: FieldRef<"Market2homeCategory", 'String'>
    readonly sourceId: FieldRef<"Market2homeCategory", 'String'>
    readonly name: FieldRef<"Market2homeCategory", 'String'>
    readonly handle: FieldRef<"Market2homeCategory", 'String'>
    readonly productIds: FieldRef<"Market2homeCategory", 'String[]'>
    readonly rawCategory: FieldRef<"Market2homeCategory", 'Json'>
    readonly importedAt: FieldRef<"Market2homeCategory", 'DateTime'>
    readonly createdAt: FieldRef<"Market2homeCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Market2homeCategory findUnique
   */
  export type Market2homeCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeCategory to fetch.
     */
    where: Market2homeCategoryWhereUniqueInput
  }

  /**
   * Market2homeCategory findUniqueOrThrow
   */
  export type Market2homeCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeCategory to fetch.
     */
    where: Market2homeCategoryWhereUniqueInput
  }

  /**
   * Market2homeCategory findFirst
   */
  export type Market2homeCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeCategory to fetch.
     */
    where?: Market2homeCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeCategories to fetch.
     */
    orderBy?: Market2homeCategoryOrderByWithRelationInput | Market2homeCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Market2homeCategories.
     */
    cursor?: Market2homeCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Market2homeCategories.
     */
    distinct?: Market2homeCategoryScalarFieldEnum | Market2homeCategoryScalarFieldEnum[]
  }

  /**
   * Market2homeCategory findFirstOrThrow
   */
  export type Market2homeCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeCategory to fetch.
     */
    where?: Market2homeCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeCategories to fetch.
     */
    orderBy?: Market2homeCategoryOrderByWithRelationInput | Market2homeCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Market2homeCategories.
     */
    cursor?: Market2homeCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Market2homeCategories.
     */
    distinct?: Market2homeCategoryScalarFieldEnum | Market2homeCategoryScalarFieldEnum[]
  }

  /**
   * Market2homeCategory findMany
   */
  export type Market2homeCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * Filter, which Market2homeCategories to fetch.
     */
    where?: Market2homeCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Market2homeCategories to fetch.
     */
    orderBy?: Market2homeCategoryOrderByWithRelationInput | Market2homeCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Market2homeCategories.
     */
    cursor?: Market2homeCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Market2homeCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Market2homeCategories.
     */
    skip?: number
    distinct?: Market2homeCategoryScalarFieldEnum | Market2homeCategoryScalarFieldEnum[]
  }

  /**
   * Market2homeCategory create
   */
  export type Market2homeCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * The data needed to create a Market2homeCategory.
     */
    data: XOR<Market2homeCategoryCreateInput, Market2homeCategoryUncheckedCreateInput>
  }

  /**
   * Market2homeCategory createMany
   */
  export type Market2homeCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Market2homeCategories.
     */
    data: Market2homeCategoryCreateManyInput | Market2homeCategoryCreateManyInput[]
  }

  /**
   * Market2homeCategory update
   */
  export type Market2homeCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * The data needed to update a Market2homeCategory.
     */
    data: XOR<Market2homeCategoryUpdateInput, Market2homeCategoryUncheckedUpdateInput>
    /**
     * Choose, which Market2homeCategory to update.
     */
    where: Market2homeCategoryWhereUniqueInput
  }

  /**
   * Market2homeCategory updateMany
   */
  export type Market2homeCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Market2homeCategories.
     */
    data: XOR<Market2homeCategoryUpdateManyMutationInput, Market2homeCategoryUncheckedUpdateManyInput>
    /**
     * Filter which Market2homeCategories to update
     */
    where?: Market2homeCategoryWhereInput
    /**
     * Limit how many Market2homeCategories to update.
     */
    limit?: number
  }

  /**
   * Market2homeCategory upsert
   */
  export type Market2homeCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * The filter to search for the Market2homeCategory to update in case it exists.
     */
    where: Market2homeCategoryWhereUniqueInput
    /**
     * In case the Market2homeCategory found by the `where` argument doesn't exist, create a new Market2homeCategory with this data.
     */
    create: XOR<Market2homeCategoryCreateInput, Market2homeCategoryUncheckedCreateInput>
    /**
     * In case the Market2homeCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<Market2homeCategoryUpdateInput, Market2homeCategoryUncheckedUpdateInput>
  }

  /**
   * Market2homeCategory delete
   */
  export type Market2homeCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
    /**
     * Filter which Market2homeCategory to delete.
     */
    where: Market2homeCategoryWhereUniqueInput
  }

  /**
   * Market2homeCategory deleteMany
   */
  export type Market2homeCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Market2homeCategories to delete
     */
    where?: Market2homeCategoryWhereInput
    /**
     * Limit how many Market2homeCategories to delete.
     */
    limit?: number
  }

  /**
   * Market2homeCategory findRaw
   */
  export type Market2homeCategoryFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Market2homeCategory aggregateRaw
   */
  export type Market2homeCategoryAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * Market2homeCategory without action
   */
  export type Market2homeCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Market2homeCategory
     */
    select?: Market2homeCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Market2homeCategory
     */
    omit?: Market2homeCategoryOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const Market2homeProductScalarFieldEnum: {
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

  export type Market2homeProductScalarFieldEnum = (typeof Market2homeProductScalarFieldEnum)[keyof typeof Market2homeProductScalarFieldEnum]


  export const Market2homeCategoryScalarFieldEnum: {
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

  export type Market2homeCategoryScalarFieldEnum = (typeof Market2homeCategoryScalarFieldEnum)[keyof typeof Market2homeCategoryScalarFieldEnum]


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


  export type Market2homeProductWhereInput = {
    AND?: Market2homeProductWhereInput | Market2homeProductWhereInput[]
    OR?: Market2homeProductWhereInput[]
    NOT?: Market2homeProductWhereInput | Market2homeProductWhereInput[]
    id?: StringFilter<"Market2homeProduct"> | string
    source?: StringFilter<"Market2homeProduct"> | string
    sourceUrl?: StringFilter<"Market2homeProduct"> | string
    sourceId?: StringFilter<"Market2homeProduct"> | string
    handle?: StringNullableFilter<"Market2homeProduct"> | string | null
    title?: StringNullableFilter<"Market2homeProduct"> | string | null
    description?: StringNullableFilter<"Market2homeProduct"> | string | null
    images?: JsonFilter<"Market2homeProduct">
    categoryRefs?: JsonFilter<"Market2homeProduct">
    rawProduct?: JsonFilter<"Market2homeProduct">
    importedAt?: DateTimeFilter<"Market2homeProduct"> | Date | string
    createdAt?: DateTimeFilter<"Market2homeProduct"> | Date | string
  }

  export type Market2homeProductOrderByWithRelationInput = {
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

  export type Market2homeProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sourceId?: string
    AND?: Market2homeProductWhereInput | Market2homeProductWhereInput[]
    OR?: Market2homeProductWhereInput[]
    NOT?: Market2homeProductWhereInput | Market2homeProductWhereInput[]
    source?: StringFilter<"Market2homeProduct"> | string
    sourceUrl?: StringFilter<"Market2homeProduct"> | string
    handle?: StringNullableFilter<"Market2homeProduct"> | string | null
    title?: StringNullableFilter<"Market2homeProduct"> | string | null
    description?: StringNullableFilter<"Market2homeProduct"> | string | null
    images?: JsonFilter<"Market2homeProduct">
    categoryRefs?: JsonFilter<"Market2homeProduct">
    rawProduct?: JsonFilter<"Market2homeProduct">
    importedAt?: DateTimeFilter<"Market2homeProduct"> | Date | string
    createdAt?: DateTimeFilter<"Market2homeProduct"> | Date | string
  }, "id" | "sourceId">

  export type Market2homeProductOrderByWithAggregationInput = {
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
    _count?: Market2homeProductCountOrderByAggregateInput
    _max?: Market2homeProductMaxOrderByAggregateInput
    _min?: Market2homeProductMinOrderByAggregateInput
  }

  export type Market2homeProductScalarWhereWithAggregatesInput = {
    AND?: Market2homeProductScalarWhereWithAggregatesInput | Market2homeProductScalarWhereWithAggregatesInput[]
    OR?: Market2homeProductScalarWhereWithAggregatesInput[]
    NOT?: Market2homeProductScalarWhereWithAggregatesInput | Market2homeProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Market2homeProduct"> | string
    source?: StringWithAggregatesFilter<"Market2homeProduct"> | string
    sourceUrl?: StringWithAggregatesFilter<"Market2homeProduct"> | string
    sourceId?: StringWithAggregatesFilter<"Market2homeProduct"> | string
    handle?: StringNullableWithAggregatesFilter<"Market2homeProduct"> | string | null
    title?: StringNullableWithAggregatesFilter<"Market2homeProduct"> | string | null
    description?: StringNullableWithAggregatesFilter<"Market2homeProduct"> | string | null
    images?: JsonWithAggregatesFilter<"Market2homeProduct">
    categoryRefs?: JsonWithAggregatesFilter<"Market2homeProduct">
    rawProduct?: JsonWithAggregatesFilter<"Market2homeProduct">
    importedAt?: DateTimeWithAggregatesFilter<"Market2homeProduct"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Market2homeProduct"> | Date | string
  }

  export type Market2homeCategoryWhereInput = {
    AND?: Market2homeCategoryWhereInput | Market2homeCategoryWhereInput[]
    OR?: Market2homeCategoryWhereInput[]
    NOT?: Market2homeCategoryWhereInput | Market2homeCategoryWhereInput[]
    id?: StringFilter<"Market2homeCategory"> | string
    source?: StringFilter<"Market2homeCategory"> | string
    sourceId?: StringNullableFilter<"Market2homeCategory"> | string | null
    name?: StringFilter<"Market2homeCategory"> | string
    handle?: StringFilter<"Market2homeCategory"> | string
    productIds?: StringNullableListFilter<"Market2homeCategory">
    rawCategory?: JsonFilter<"Market2homeCategory">
    importedAt?: DateTimeFilter<"Market2homeCategory"> | Date | string
    createdAt?: DateTimeFilter<"Market2homeCategory"> | Date | string
  }

  export type Market2homeCategoryOrderByWithRelationInput = {
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

  export type Market2homeCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    handle?: string
    AND?: Market2homeCategoryWhereInput | Market2homeCategoryWhereInput[]
    OR?: Market2homeCategoryWhereInput[]
    NOT?: Market2homeCategoryWhereInput | Market2homeCategoryWhereInput[]
    source?: StringFilter<"Market2homeCategory"> | string
    sourceId?: StringNullableFilter<"Market2homeCategory"> | string | null
    name?: StringFilter<"Market2homeCategory"> | string
    productIds?: StringNullableListFilter<"Market2homeCategory">
    rawCategory?: JsonFilter<"Market2homeCategory">
    importedAt?: DateTimeFilter<"Market2homeCategory"> | Date | string
    createdAt?: DateTimeFilter<"Market2homeCategory"> | Date | string
  }, "id" | "handle">

  export type Market2homeCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    productIds?: SortOrder
    rawCategory?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
    _count?: Market2homeCategoryCountOrderByAggregateInput
    _max?: Market2homeCategoryMaxOrderByAggregateInput
    _min?: Market2homeCategoryMinOrderByAggregateInput
  }

  export type Market2homeCategoryScalarWhereWithAggregatesInput = {
    AND?: Market2homeCategoryScalarWhereWithAggregatesInput | Market2homeCategoryScalarWhereWithAggregatesInput[]
    OR?: Market2homeCategoryScalarWhereWithAggregatesInput[]
    NOT?: Market2homeCategoryScalarWhereWithAggregatesInput | Market2homeCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Market2homeCategory"> | string
    source?: StringWithAggregatesFilter<"Market2homeCategory"> | string
    sourceId?: StringNullableWithAggregatesFilter<"Market2homeCategory"> | string | null
    name?: StringWithAggregatesFilter<"Market2homeCategory"> | string
    handle?: StringWithAggregatesFilter<"Market2homeCategory"> | string
    productIds?: StringNullableListFilter<"Market2homeCategory">
    rawCategory?: JsonWithAggregatesFilter<"Market2homeCategory">
    importedAt?: DateTimeWithAggregatesFilter<"Market2homeCategory"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Market2homeCategory"> | Date | string
  }

  export type Market2homeProductCreateInput = {
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

  export type Market2homeProductUncheckedCreateInput = {
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

  export type Market2homeProductUpdateInput = {
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

  export type Market2homeProductUncheckedUpdateInput = {
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

  export type Market2homeProductCreateManyInput = {
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

  export type Market2homeProductUpdateManyMutationInput = {
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

  export type Market2homeProductUncheckedUpdateManyInput = {
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

  export type Market2homeCategoryCreateInput = {
    id: string
    source: string
    sourceId?: string | null
    name: string
    handle: string
    productIds?: Market2homeCategoryCreateproductIdsInput | string[]
    rawCategory: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type Market2homeCategoryUncheckedCreateInput = {
    id: string
    source: string
    sourceId?: string | null
    name: string
    handle: string
    productIds?: Market2homeCategoryCreateproductIdsInput | string[]
    rawCategory: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type Market2homeCategoryUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: Market2homeCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type Market2homeCategoryUncheckedUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: Market2homeCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type Market2homeCategoryCreateManyInput = {
    id: string
    source: string
    sourceId?: string | null
    name: string
    handle: string
    productIds?: Market2homeCategoryCreateproductIdsInput | string[]
    rawCategory: InputJsonValue
    importedAt: Date | string
    createdAt?: Date | string
  }

  export type Market2homeCategoryUpdateManyMutationInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: Market2homeCategoryUpdateproductIdsInput | string[]
    rawCategory?: InputJsonValue | InputJsonValue
    importedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type Market2homeCategoryUncheckedUpdateManyInput = {
    source?: StringFieldUpdateOperationsInput | string
    sourceId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    handle?: StringFieldUpdateOperationsInput | string
    productIds?: Market2homeCategoryUpdateproductIdsInput | string[]
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

  export type Market2homeProductCountOrderByAggregateInput = {
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

  export type Market2homeProductMaxOrderByAggregateInput = {
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

  export type Market2homeProductMinOrderByAggregateInput = {
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

  export type Market2homeCategoryCountOrderByAggregateInput = {
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

  export type Market2homeCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    sourceId?: SortOrder
    name?: SortOrder
    handle?: SortOrder
    importedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type Market2homeCategoryMinOrderByAggregateInput = {
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

  export type Market2homeCategoryCreateproductIdsInput = {
    set: string[]
  }

  export type Market2homeCategoryUpdateproductIdsInput = {
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