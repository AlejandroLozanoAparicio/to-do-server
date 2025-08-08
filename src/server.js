import express from "express";
import { config } from "./config/config";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
} from "graphql";
import joinMonster from "join-monster";
import { Client } from "pg";

const Subtask = new GraphQLObjectType({
  name: "Subtask",
  extensions: {
    joinMonster: {
      sqlTable: "subtask",
      uniqueKey: "id",
    },
  },
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    position: { type: GraphQLInt },
    parent_task_id: {
      type: GraphQLNonNull(GraphQLInt),
    },
  }),
});

const Task = new GraphQLObjectType({
  name: "Task",
  extensions: {
    joinMonster: {
      sqlTable: "task",
      uniqueKey: "id",
    },
  },
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    position: { type: GraphQLInt },
    list_id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    subtasks: {
      type: new GraphQLList(Subtask),
      extensions: {
        joinMonster: {
          sqlJoin: (taskTable, subtaskTable, args) =>
            `${taskTable}.id = ${subtaskTable}.parent_task_id`,
        },
      },
    },
  }),
});

const List = new GraphQLObjectType({
  name: "List",
  extensions: {
    joinMonster: {
      sqlTable: "list",
      uniqueKey: "id",
    },
  },
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    position: { type: GraphQLInt },
    tasks: {
      type: new GraphQLList(Task),
      extensions: {
        joinMonster: {
          sqlJoin: (listTable, taskTable, args) =>
            `${listTable}.id = ${taskTable}.list_id`,
        },
      },
    },
  }),
});

const QueryRoot = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    hello: {
      type: GraphQLString,
      resolve: () => "Hello world!",
    },
    lists: {
      type: new GraphQLList(List),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => client.query(sql));
      },
    },
    list: {
      type: List,
      args: { id: { type: GraphQLNonNull(GraphQLInt) } },
      extensions: {
        joinMonster: {
          where: (listTable, args, context) => `${listTable}.id = ${args.id}`,
        },
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => client.query(sql));
      },
    },
    tasks: {
      type: new GraphQLList(Task),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => client.query(sql));
      },
    },
    task: {
      type: Task,
      args: { id: { type: GraphQLNonNull(GraphQLInt) } },
      extensions: {
        joinMonster: {
          where: (taskTable, args, context) => `${taskTable}.id = ${args.id}`,
        },
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => client.query(sql));
      },
    },
    subtasks: {
      type: new GraphQLList(Subtask),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    subtask: {
      type: Subtask,
      args: { id: { type: GraphQLNonNull(GraphQLInt) } },
      extensions: {
        joinMonster: {
          where: (subtaskTable, args, context) =>
            `${subtaskTable}.id = ${args.id}`,
        },
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
  }),
});

const schema = new GraphQLSchema({ query: QueryRoot });

const client = new Client({
  host: config.host,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
});
client.connect();

const app = express();
app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
app.listen(config.port);
