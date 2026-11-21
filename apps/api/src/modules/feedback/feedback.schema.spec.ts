import 'reflect-metadata';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Query, Resolver } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { printSchema } from 'graphql';
import { PublicFeedbackResolver } from './public-feedback.resolver';

// GraphQL requires a Query type to build a schema.
@Resolver()
class StubQueryResolver {
  @Query(() => String)
  ping() {
    return 'pong';
  }
}

describe('GraphQL schema', () => {
  it('exposes Mutation.createFeedback', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    const factory = moduleRef.get(GraphQLSchemaFactory);
    const schema = await factory.create([
      StubQueryResolver,
      PublicFeedbackResolver,
    ]);
    const printed = printSchema(schema);
    expect(printed).toMatch(/type Mutation \{[^}]*createFeedback\(/);
  });
});
