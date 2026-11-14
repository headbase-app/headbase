/**
 * Driver interface for interacting with the database;
 */
export abstract class IMatterDriver {
    isReady!: boolean;

    abstract init(): Promise<void>;

    /**
     * Return a cryptographically random UUID suitable for automatic vid generation.
     */
    abstract randomUUID(): string

    /**
     * Run an SQL statement that doesn't return any results or require binding params.
     *
     * @param sql
     */
    abstract run(sql: string): Promise<void>;

    /**
     * Run an SQL query which should return results.
     * Results should always be returned as an array, even if there is only one result.
     *
     * @param sql
     * @param params
     */
    abstract query<T>(sql: string, params?: any[]): Promise<T>;

    /**
     * Close the database connection / run any required cleanup.
     */
    abstract close?(): Promise<void>;
}
