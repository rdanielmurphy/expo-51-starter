import { SQL_INSERT_ADDRESS } from "./sqlCommands";
import { IAddress } from "./types";

export const getNewAddressInsertStatement = (addr: IAddress, isPrimary: number, type: string) => 
    SQL_INSERT_ADDRESS(addr.city, isPrimary, addr.state, addr.addr1, addr.addr2 || '', type, addr.zip)
