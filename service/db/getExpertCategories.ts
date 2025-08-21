import { db } from "./db"
import { OperationResult } from "../types";

export const getExpertCategories = async() : Promise<OperationResult<string[]>> => {
        const { error, data } = await db
                                    .from("get_expert_categories")
                                    .select("*")

        if(error)
            return { error: error.message }

        const categories = data?.map(x => { return x.category });

        return { 
            error, 
            data: categories
        }
}