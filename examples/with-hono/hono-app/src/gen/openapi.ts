import { z } from "zod";

// Category model
/*
 ██████╗ ██████╗ ███╗   ███╗██████╗  ██████╗ ███╗   ██╗███████╗███╗   ██╗████████╗███████╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗████╗  ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║██╔██╗ ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██║╚██╗██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝██║ ╚████║███████╗██║ ╚████║   ██║   ███████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
*/
export const schemaCategory = z.object({
    id: z.string().cuid2(),
    // category name
    name: z.string().min(2).max(32),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// Category model
export const schemaCategoryCreate = z.object({
    // category name
    name: z.string().min(2).max(32)
});

// Category model
export const schemaCategoryCreateItem = z.object({
    // category name
    name: z.string().min(2).max(32)
});

// Category model
export const schemaCategoryUpdate = z.object({
    id: z.string().cuid2().nullish(),
    // category name
    name: z.string().min(2).max(32).nullish()
});

// Post model
export const schemaPost = z.object({
    id: z.string().cuid2(),
    title: z.string().min(1),
    // Markdown formatted string
    body: z.string().min(1),
    categories: z.array(z.object({
        id: z.string().cuid2(),
        // category name
        name: z.string().min(2).max(32),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// Post model
export const schemaPostCreate = z.object({
    title: z.string().min(1),
    // Markdown formatted string
    body: z.string().min(1),
    categories: z.array(z.object({
        // category name
        name: z.string().min(2).max(32)
    }))
});

// Post model
export const schemaPostCreateItem = z.object({
    title: z.string().min(1),
    // Markdown formatted string
    body: z.string().min(1),
    categories: z.array(z.object({
        // category name
        name: z.string().min(2).max(32)
    }))
});

// Post model
export const schemaPostUpdate = z.object({
    id: z.string().cuid2().nullish(),
    title: z.string().min(1).nullish(),
    // Markdown formatted string
    body: z.string().min(1).nullish(),
    categories: z.array(z.object({
        id: z.string().cuid2(),
        // category name
        name: z.string().min(2).max(32),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })).nullish()
});

// User model
export const schemaUser = z.object({
    id: z.string().cuid2(),
    // username
    name: z.string().min(2).max(32),
    email: z.string().email(),
    age: z.number().int().gte(18),
    posts: z.array(z.object({
        id: z.string().cuid2(),
        title: z.string().min(1),
        // Markdown formatted string
        body: z.string().min(1),
        categories: z.array(z.object({
            id: z.string().cuid2(),
            // category name
            name: z.string().min(2).max(32),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime()
        })),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// User model
export const schemaUserCreate = z.object({
    // username
    name: z.string().min(2).max(32),
    email: z.string().email(),
    age: z.number().int().gte(18),
    posts: z.array(z.object({
        title: z.string().min(1),
        // Markdown formatted string
        body: z.string().min(1),
        categories: z.array(z.object({
            // category name
            name: z.string().min(2).max(32)
        }))
    }))
});

// User model
export const schemaUserUpdate = z.object({
    id: z.string().cuid2().nullish(),
    // username
    name: z.string().min(2).max(32).nullish(),
    email: z.string().email().nullish(),
    age: z.number().int().gte(18).nullish(),
    posts: z.array(z.object({
        id: z.string().cuid2(),
        title: z.string().min(1),
        // Markdown formatted string
        body: z.string().min(1),
        categories: z.array(z.object({
            id: z.string().cuid2(),
            // category name
            name: z.string().min(2).max(32),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime()
        })),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })).nullish()
});

export const schemaCuid2 = z.string().cuid2();

/*
██████╗  █████╗ ████████╗██╗  ██╗███████╗
██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔════╝
██████╔╝███████║   ██║   ███████║███████╗
██╔═══╝ ██╔══██║   ██║   ██╔══██║╚════██║
██║     ██║  ██║   ██║   ██║  ██║███████║
╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
*/
export const pathCategoriesGet = z.object({
    id: z.string().cuid2().nullish()
});

export const pathCategoriesDelete = z.object({
    id: z.string().cuid2().nullish()
});

export const pathCategoriesUpdate = z.object({
    id: z.string().cuid2().nullish()
});

export const pathPostsGet = z.object({
    id: z.string().cuid2().nullish()
});

export const pathPostsDelete = z.object({
    id: z.string().cuid2().nullish()
});

export const pathPostsUpdate = z.object({
    id: z.string().cuid2().nullish()
});

export const pathUsersGet = z.object({
    id: z.string().cuid2().nullish()
});

export const pathUsersDelete = z.object({
    id: z.string().cuid2().nullish()
});

export const pathUsersUpdate = z.object({
    id: z.string().cuid2().nullish()
});

/*
 ██████╗ ██╗   ██╗███████╗██████╗ ██╗███████╗███████╗
██╔═══██╗██║   ██║██╔════╝██╔══██╗██║██╔════╝██╔════╝
██║   ██║██║   ██║█████╗  ██████╔╝██║█████╗  ███████╗
██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗██║██╔══╝  ╚════██║
╚██████╔╝╚██████╔╝███████╗██║  ██║██║███████╗███████║
 ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
*/
export const queryCategoriesList = z.object({
    limit: z.string().default("20").nullish(),
    offset: z.string().default("0").nullish()
});

export const queryPostsList = z.object({
    limit: z.string().default("20").nullish(),
    offset: z.string().default("0").nullish()
});

export const queryUsersList = z.object({
    limit: z.string().default("20").nullish(),
    offset: z.string().default("0").nullish()
});