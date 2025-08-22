import { getAccessKeys } from "../../db/getAccessKeys";
import { updateAccessKeyStatus } from "../../db/updateAccessKeyStatus";
import { OperationResult } from "../../types";

export const deactivateAccessKey = async (account: string, id: number): Promise<OperationResult<void>> => {
    const { error: getError, data: keys } = await getAccessKeys({ id });

    if (getError) {
        return { error: getError };
    }

    if (!keys || keys.length === 0) {
        return { error: "Access key not found" };
    }

    const key = keys[0];
    if (key.owner_address !== account) {
        return { error: "Access key does not belong to the specified account" };
    }

    const { error: updateError } = await updateAccessKeyStatus(id, false);

    if (updateError) {
        return { error: updateError };
    }

    return { message: "Access key deactivated successfully" };
};
