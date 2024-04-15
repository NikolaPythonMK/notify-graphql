import { Color, Page } from "@prisma/client";
import { GraphQLContext } from "../context";
import { CreatePage } from "../types/CreatePage";
import { UpdatePage } from "../types/UpdatePage";
import { convertToColorEnum } from "../utils/ConvertColorStringToEnum";
import { GraphQLError } from "graphql/error";
import { getShortContent } from "../utils/shortContent";


export const resolvers = {
    Query: {
        categories: (parent: unknown, args: {}, context: GraphQLContext) => {
            return context.prisma.category.findMany({
                include: {
                    pages: {
                        where: {isTrashed: false}
                    }
                }
            });
        },
        // category: (parent: unknown, args: {id: string}, context: GraphQLContext) => {
        //     const id = parseInt(args.id);
        //     return context.prisma.category.findUnique({
        //         where: {id: id},
        //         include: {pages: true} // Eager load pages to ensure an empty array if no pages exist
        //     })
        // },
        category: (parent: unknown, args: {id: string}, context: GraphQLContext) => {
            const id = parseInt(args.id);
            return context.prisma.category.findUnique({
                where: {id: id},
                include: {
                    pages: {
                        where: {
                            isTrashed: false  // Only include pages where isTrashed is false
                        }
                    }
                }
            });
        },
        
        page: (parent: unknown, args: {id: string}, context: GraphQLContext) => {
            const id = parseInt(args.id);
            return context.prisma.page.findUnique({
                where: {id: id}
            })
        },
        allPages: (parent: unknown, args: {id: string}, context: GraphQLContext) => {
            return context.prisma.page.findMany({
                where: {
                    isTrashed: false
                }
            });
        },

        // Ensure that there are appropriate indexes on the title, content, and categoryId fields to improve the performance of these queries.
        // Adding input validation can prevent issues like SQL injection or querying errors due to invalid categoryId values.
        searchPages: async (parent: unknown, args: {term: string, categoryId: string}, context: GraphQLContext) => {
            const { term, categoryId } = args;
            const whereClause: any = {
                OR: [
                    {
                        title: {
                            contains: term,
                            mode: 'insensitive'
                        }
                    },
                    {
                        content: {
                            contains: term,
                            mode: 'insensitive'
                        }
                    }
                ]
            };

            if(categoryId){
                const id = parseInt(categoryId);
                whereClause['categoryId'] = id;
            }
            let pages = await context.prisma.page.findMany({
                where: whereClause
            });
        
            return pages;
        }
    },
    Mutation: {
        createCategory: (parent: unknown, args: {name: string}, context: GraphQLContext) => {
            return context.prisma.category.create({data: {name: args.name }})
        },
        updateCategory: (parent: unknown, args: {id: string, name: string}, context: GraphQLContext) => {
            const id = parseInt(args.id);
            return context.prisma.category.update({
                where: {
                    id: id
                },
                data: {
                    name: args.name
                }
            })
        },
        deleteCategory: (parent: unknown, args: {id: string}, context: GraphQLContext) => {
            const id = parseInt(args.id);
            return context.prisma.category.delete({
                where: {
                    id: id
                }
            })
        },
        createPage: (parent: unknown, args: {input: CreatePage}, context: GraphQLContext) => {
            const color = convertToColorEnum(args.input.color);
            if (!color){
                return Promise.reject(
                    new GraphQLError(`Invalid Color: '${args.input.color}'.`)
                  )
            }
            return context.prisma.page.create({
                data: {
                    title: args.input.title,
                    content: args.input.content,
                    categoryId: parseInt(args.input.categoryId),
                    color: color,
                    short_content: getShortContent(args.input.content)
                }
            })
        },
        updatePage: (parent: unknown, args: {input: UpdatePage}, context: GraphQLContext) => {
            const id = parseInt(args.input.id);
            const color = convertToColorEnum(args.input.color);
            if (!color){
                return Promise.reject(
                    new GraphQLError(`Invalid Color: '${args.input.color}'.`)
                  )
            }
            return context.prisma.page.update({
                where: {
                    id: id,
                },
                data: {
                    title: args.input.title,
                    content: args.input.content,
                    color: color,
                    short_content: getShortContent(args.input.content)
                }
            })
        },
        deletePage: (parent: unknown, args: {id: string}, context: GraphQLContext) => {
            const id = parseInt(args.id);
            return context.prisma.page.update({
                where: {
                    id: id,
                },
                data: {
                    isTrashed: true
                }
            })
        },
        toggleFavoritePage: async (parent: unknown, args: {id: string}, context: GraphQLContext) => {
            const id = parseInt(args.id);
            const page = await context.prisma.page.findUnique({where: {id: id}});

            if (!page) {
                throw new Error("Page not found");
            }

            return context.prisma.page.update({
                where: {
                    id: id
                },
                data: {
                    isFavorited: !page.isFavorited
                }
            })
        },
        restorePage: (parent: unknown, args: {pageId: string}, context: GraphQLContext) => {
            const id = parseInt(args.pageId);
            return context.prisma.page.update({
                where: {
                    id: id
                },
                data: {
                    isTrashed: false
                }
            })
        },
        clearTrash: async (parent: unknown, args: {}, context: GraphQLContext) => {
            const result = await context.prisma.page.deleteMany({
                where: {
                    isTrashed: true
                }
            })
            return result.count;
        }
    },
    Page: {
        category: (parent: Page, args: {}, context: GraphQLContext) => {
            return context.prisma.category.findUnique({
                where: {
                    id: parent.categoryId
                }
            })
        }
    }
}