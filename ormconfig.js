module.exports = [
  {
    name: "default",
    host: "localhost",
    type: "postgres",
    port: 5432,
    username: "test",
    password: "test",
    database: "test",
    logging: false,
    synchronize: true,
    entities: ["src/entity/**/*.ts"],
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
    synchronize: true,
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
