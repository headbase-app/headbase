export type QueryWhere = {
    [field: string]: {
        $equal?: string | number | boolean
        $notEqual?: string | number | boolean
        $includes?: string | number
        $notIncludes?: string | number
        $in?: string[] | number[]
        $notIn?: string[] | number[]
        $less?: string | number
        $lessEqual?: string | number
        $greater?: string | number
        $greaterEqual?: string | number
        $and?: QueryWhere[]
        $or?: QueryWhere[]
    }
} & {
    $and?: QueryWhere[]
    $or?: QueryWhere[]
}

export interface QueryOrder {
    [field: string]: "asc" | "desc"
}

export interface QueryPage {
    limit?: number
    offset?: number
}

export interface Query {
    where?: QueryWhere
    order?: QueryOrder
    page?: QueryPage
}

export interface ParsedQuery {
    sql: string;
    params: (string|number|null|Uint8Array)[]
}

export interface TableQuery extends Query {
    from: string
}

export function parseQuery(query: TableQuery): ParsedQuery {
    let sql = `select * from ${query.from}`
    let params: ParsedQuery['params'] = []

    return {
        sql,
        params,
    }
}
