import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account, Balance } from "../../generated/schema";
import { Transfer } from "../../generated/Swapr/ERC20";
import { ADDRESS_ZERO } from "./constants";

export function handleTransfer(event: Transfer): void {
  // Ignore 0 amount transfers
  if (event.params.value == BigInt.fromI32(0)) {
    return
  }

  // Snapshot to June 30th 2023
  let snapshot = BigInt.fromString("1688169599");
  if (event.block.timestamp.gt(snapshot)) {
    return;
  }
  
  let accountFrom = getOrCreateAccount(event.params.from)
  let accountTo = getOrCreateAccount(event.params.to)

  // log.warning("Transfer {} tokens from {} to {} on {}", [event.params.value.toString(), event.params.from.toHexString(), event.params.to.toHexString(), event.transaction.hash.toHexString()]);
  
  let balanceFrom = getOrCreateBalance(event.params.from, event.address)

  if (balanceFrom != null) {
    //log.warning("Current balance from {} is {} future balance is {} and value {}", [event.params.from.toHexString(), balanceFrom.balance.toString(), balanceFrom.balance.minus(event.params.value).toString(), event.params.value.toString()]);
    balanceFrom.balance = balanceFrom.balance.minus(event.params.value)
    balanceFrom.blockNumber = event.block.number
    balanceFrom.timestamp = event.block.timestamp
    balanceFrom.account = accountFrom.id
    balanceFrom.save()
  }

  let balanceTo = getOrCreateBalance(event.params.to, event.address)
  if (balanceTo != null) {
    //log.warning("Current balance to {} is {} future balance is {} and value {}", [event.params.to.toHexString(), balanceTo.balance.toString(), balanceTo.balance.plus(event.params.value).toString(), event.params.value.toString()]);
    balanceTo.balance = balanceTo.balance.plus(event.params.value)
    balanceTo.blockNumber = event.block.number
    balanceTo.timestamp = event.block.timestamp
    balanceTo.account = accountTo.id
    balanceTo.save()
  }
}

export function getOrCreateAccount(address: Address): Account {
  let addressHex = address.toHexString()
  let account = Account.load(addressHex)
  if (account != null) {
    return account as Account
  }

  account = new Account(addressHex)
  account.save()
  return account as Account
}

export function getOrCreateBalance(account: Address, token: Address): Balance | null {
  let accountHex = account.toHexString()
  if (accountHex == ADDRESS_ZERO) {
    return null
  }
  let tokenHex = token.toHexString()
  let balance = Balance.load(tokenHex + "|" + accountHex)
  if (balance != null) {
    return balance as Balance
  }

  balance = new Balance(tokenHex + "|" + accountHex)
  balance.balance = BigInt.fromI32(0)
  balance.blockNumber = BigInt.fromI32(0)
  balance.timestamp = BigInt.fromI32(0)
  balance.account = accountHex
  balance.token = tokenHex
  balance.save()
  return balance as Balance
}
