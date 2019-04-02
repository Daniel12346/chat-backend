module.exports = [
  {
    name: "test",
    host: "localhost",
    type: "postgres",
    port: 5432,
    username: "test",
    password: "test",
    database: "test",
    logging: false,
    entities: [__dirname + "/../**/**.entity{.ts,.js}"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber"
    }
  },
  {
    name: "heroku",
    url: process.env.DATABASE_URL,
    type: "postgres",

    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber"
    }
  }
];
