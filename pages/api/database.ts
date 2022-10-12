import { Pool } from 'pg'

const pool = new Pool({
    user: 'postgres',
    host: 'host',
    password: 'password',
    port: 5432
})

export default async function queryDatabase(sql: string, params: Array<any>){
    return pool.query(sql, params)
}