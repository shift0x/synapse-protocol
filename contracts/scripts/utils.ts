export const sleep = async (timeout: number) : Promise<void> => {
    return new Promise((resovle: any) => {
        setTimeout(() => {
            resovle()
        }, timeout * 1000)
    })
}