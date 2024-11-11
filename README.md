# typespec-to-zod

**typespec-to-zod** is a tool for generating Zod schemas from YAML files produced by TypeSpec.

It facilitates the transformation of type specifications into working Zod schemas seamlessly.

## Getting Started

Below is an example of how to execute the tool.

```sh
typespec-to-zod -i example/openapi.yaml -o example/openapi.ts -c true -p true -q true
```

## Command-line options

| Options            | Description                                |
|--------------------|--------------------------------------------|
| `-i, --input`      | Path to the OpenAPI YAML file.             |
| `-o, --output`     | Output file path for the generated schema. |
| `-c, --components` | Flag to generate components.               |
| `-p, --paths`      | Flag to generate paths.                    |
| `-q, --queries`    | Flag to generate queries.                  |

## Supported TypeSpec built-in types

See [Built-in types | TypeSpec](https://typespec.io/docs/language-basics/built-in-types).

### Numeric types

| TypeSpec Type  |  Zod Type Conversion  |
|----------------|-----------------------|
| numeric        | z.number()            |
| integer        | z.number()            |
| float          | z.number()            |
| int64          | z.number().int()      |
| int32          | z.number().int()      |
| int16          | z.number().int()      |
| int8           | z.number().int()      |
| safeint        | z.number().int()      |
| uint64         | z.number().int()      |
| uint32         | z.number().int()      |
| uint16         | z.number().int()      |
| uint8          | z.number().int()      |
| float32        | z.number()            |
| float64        | z.number()            |
| decimal        | z.number()            |
| decimal128     | z.number()            |

```tsp
model NumericTypes {
  numericProperty: numeric;
  integerProperty: integer;
  floatProperty: float;
  int64Property: int64;
  int32Property: int32;
  int16Property: int16;
  int8Property: int8;
  safeintProperty: safeint;
  uint64Property: uint64;
  uint32Property: uint32;
  uint16Property: uint16;
  uint8Property: uint8;
  float32Property: float32;
  float64Property: float64;
  decimalProperty: decimal;
  decimal128Property: decimal128;
}
```

```ts
export const schemaNumericTypes = z.object({
  numericProperty: z.number(),
  integerProperty: z.number(),
  floatProperty: z.number(),
  int64Property: z.number().int(),
  int32Property: z.number().int(),
  int16Property: z.number().int(),
  int8Property: z.number().int(),
  safeintProperty: z.number().int(),
  uint64Property: z.number().int(),
  uint32Property: z.number().int(),
  uint16Property: z.number().int(),
  uint8Property: z.number().int(),
  float32Property: z.number(),
  float64Property: z.number(),
  decimalProperty: z.number(),
  decimal128Property: z.number()
})
```

## Date and time types

| TypeSpec Type  |  Zod Type Conversion  |
|----------------|-----------------------|
| plainDate      | z.string().date()     |
| plainTime      | z.string().time()     |
| utcDateTime    | z.string().datetime() |
| offsetDateTime | z.string().datetime() |
| duration       | z.string().duration   |

```tsp
model DateAndTimeTypes {
  plainDateProperty: plainDate;
  plainTimeProperty: plainTime;
  utcDateTimeProperty: utcDateTime;
  offsetDateTimeProperty: offsetDateTime;
  durationProperty: duration;
}
```

```ts
export const schemaDateAndTimeTypes = z.object({
  plainDateProperty: z.string().date(),
  plainTimeProperty: z.string().time(),
  utcDateTimeProperty: z.string().datetime(),
  offsetDateTimeProperty: z.string().datetime(),
  durationProperty: z.string().duration()
})
```

## Other core types

| TypeSpec Type     |  Zod Type Conversion                     |
|-------------------|------------------------------------------|
| bytes             | Not supported but generate as z.string() |
| string            | z.string()                               |
| boolean           | z.boolean()                              |
| null              | z.unknown()                              |
| Array\<Element\>  | z.array(z.Element())                     |
| Record\<Element\> | z.record(z.string(), z.Element())        |
| unknown           | z.unknown()                              |
| void              | NOT SUPPORTED                            |
| never             | NOT SUPPORTED                            |

```tsp
model OtherCoreTypes {
  bytesProperty: bytes;
  stringProperty: string;
  booleanProperty: boolean;
  nullProperty: null;
  ArrayProperty: numeric[];
  recordProperty: Record<numeric>;
  unknownProperty: unknown;
  // voidProperty: void; NOT SUPPORTED
  // neverProperty: never; NOT SUPPORTED
}
```

```ts
export const schemaOtherCoreTypes = z.object({
  bytesProperty: z.string(),
  stringProperty: z.string(),
  booleanProperty: z.boolean(),
  nullProperty: z.unknown(),
  ArrayProperty: z.array(z.number()),
  recordProperty: z.record(z.string(), z.number()),
  unknownProperty: z.unknown()
})
```

## String types

| TypeSpec Type  |  Zod Type Conversion |
|----------------|----------------------|
| url            | z.string().url()     |

```tsp
model StringTypes {
  urlProperty: url;
}
```

```ts
export const schemaStringTypes = z.object({
  urlProperty: z.string().url()
})
```

## Supported TypeSpec Decorators

The following TypeSpec decorators are transformed into equivalent Zod constraints.

| TypeSpec Decorator  | Zod Type Conversion |
|---------------------|---------------------|
| @minItems()         | .min()              |
| @maxItems()         | .max()              |
| @minLength()        | .min()              |
| @maxLength()        | .max()              |
| @minValue()         | .gte()              |
| @maxValue()         | .lte()              |
| @exclusiveMinimum() | .gt()               |
| @exclusiveMaximum() | .lt()               |

```tsp
model TypeSpecDecorators {
  @minItems(1)
  @maxItems(5)
  items: string[];

  @minLength(1)
  @maxLength(5)
  name: string;

  @minValue(1)
  @maxValue(5)
  age: int16;

  @minValueExclusive(1)
  @maxValueExclusive(5)
  count: int16;
}

```

```ts
export const schemaTypeSpecDecorators = z.object({
  items: z.array(z.string()).min(1).max(5),
  name: z.string().min(1).max(5),
  age: z.number().int().gte(1).lte(5),
  count: z.number().int().gt(1).lt(5)
})
```

## Supported TypeSpec Format Decorators

The following TypeSpec formats are converted into Zod formats.

| TypeSpec Format      | Zod Type Conversion |
|----------------------|---------------------|
| @format("date-time") | .datetime()         |
| @format("date")      | .date()             |
| @format("time")      | .time()             |
| @format("duration")  | .duration()         |
| @format("ip")        | .ip()               |
| @format("email")     | .email()            |
| @format("uuid")      | .uuid()             |
| @format("cuid")      | .cuid()             |
| @format("cuid2")     | .cuid2()            |
| @format("uri")       | .url()              |
| @format("url")       | .url()              |

## Contributing

Contributions are welcome!

If you find a bug or have a feature request, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
