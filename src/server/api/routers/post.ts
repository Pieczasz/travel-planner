import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // create: protectedProcedure
  //   .input(
  //     z.object({
  //       content: z.string().min(20),
  //       type: z.enum(["life", "productivity", "coding", "trading"]),
  //       title: z.string().min(3),
  //       slug: z.string().min(3),
  //       createdAt: z.string(),
  //       updatedAt: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const timeElapsed = Date.now();
  //     const today = new Date(timeElapsed);

  //     await ctx.db.insert(posts).values({
  //       title: input.title,
  //       slug: input.slug,
  //       content: input.content,
  //       createdAt: today.toUTCString(),
  //       updatedAt: today.toUTCString(),
  //       type: input.type,
  //     });
  //   }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
