import { OperationResult } from '../types';
import {db} from './db'

export const storeAccessKey = async (owner: string, key: string) : Promise<OperationResult<void>> => {
    const {error} = await db.from("access_keys")
        .insert({
            owner_address: owner,
            access_key: key
        })

    if(error)
        return { error}

    return {};
}