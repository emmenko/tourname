/**
 * Convert polymorphic variant to JS string
 * https://bucklescript.github.io/docs/en/generate-converters-accessors.html#convert-between-js-string-enum-and-bs-polymorphic-variant
 */
[@bs.deriving jsConverter]
type discipline = [ | `PoolTable | `TableTennis];

[@bs.deriving jsConverter]
type tournamentSize = [ | `Small | `Medium | `Large];

[@bs.deriving jsConverter]
type tournamentStatus = [ | `New | `InProgress | `Finished];