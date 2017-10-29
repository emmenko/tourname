# Types
This folder contains the different GraphQL types with their schemas.

The DB documents however are slightly different from the GraphQL types.

### User
> We don't directly store users, instead we fetch user information from Auth0 Management API

### Organization

```js
{
  _id, // string (given by the user as `key`)
  createdAt, // ISO datetime
  lastModifiedAt, // ISO datetime
  name, // string
  users: [
    {
      id, // UUID
      isAdmin, // boolean
    }
  ],
}
```

### Tournament

```js
{
  _id, // UUID
  createdAt, // ISO datetime
  lastModifiedAt, // ISO datetime
  size, // enum
  discipline, // enum
  name, // string
  organizationId, // UUID
  status, // enum
  teamSize, // int
  teams: {
    qwerty: [], // key: string, value: array of UUIDs
  },
  matchesLeg1: [], // array of UUIDs
  matchesLeg2, // UUID (the last match leg, otherwise an array)
}
```

### Match

```js
{
  _id, // UUID
  createdAt, // ISO datetime
  lastModifiedAt, // ISO datetime
  teamLeft: {
    key, // string
    players: [], // array of UUIDs
  },
  teamRight: {
    key, // string
    players: [], // array of UUIDs
  },
  winner: {
    key, // string
    players: [], // array of UUIDs
  },
  nextMatchId, // UUID
  tournamentId, // UUID
  discipline, // enum
}
```
