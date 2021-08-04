export default interface IBroadcast {
    broadcast: (...args: any[]) => Promise<any>
}
