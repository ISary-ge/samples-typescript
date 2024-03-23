import * as Accounts from '../types/accounts-client';
import * as Banking from '../types/banking-client';
import * as Clients from '../types/clients-client';
import * as PostOffice from '../types/post-office-client';
import * as Commands from '../types/commands';
import { log } from '@temporalio/activity';
import { readFileSync, writeFileSync } from 'fs'
import { uuid4 } from '@temporalio/workflow'

export interface BoundedContextClients {
  accounts: Accounts.Client;
  banking: Banking.Client;
  clients: Clients.Client;
  postOffice: PostOffice.Client;
}

class ClientsServiceClient implements Clients.Client {
  async removeClient(params: Commands.RemoveClient): Promise<void> {
    let oldClients: any = readFileSync('clients.json').toString();
    oldClients = !oldClients ? [] : JSON.parse(oldClients);
    writeFileSync('clients.json', JSON.stringify(oldClients.filter(client => client.accountId !== params.accountId)))
    log.info('REMOVING CLIENT', { params });
  }

  async addClient(params: Commands.AddClient): Promise<void> {
    let oldClients: any = readFileSync('clients.json').toString();
    oldClients = !oldClients ? [] : JSON.parse(oldClients);
    writeFileSync('clients.json', JSON.stringify([...oldClients,params]))
    if (params.shouldThrow) {
      throw new Error(params.shouldThrow);
    }
    log.info('ADDING CLIENT', { params });
  }
}
class AccountsClient implements Accounts.Client {
  async createAccount(params: Commands.CreateAccount): Promise<void> {
    let oldAccounts: any = readFileSync('accounts.json').toString();
    oldAccounts = !oldAccounts ? [] : JSON.parse(oldAccounts);
    writeFileSync('accounts.json', JSON.stringify([...oldAccounts, params]))
    if (params.shouldThrow) {
      throw new Error(params.shouldThrow);
    }
    log.info('CREATING ACCOUNT', { params });
  }
}
class BankingClient implements Banking.Client {
  async addBankAccount(params: Commands.AddBankAccount): Promise<void> {
    let bankAccounts: any = readFileSync('bank-accounts.json').toString();
    bankAccounts = !bankAccounts ? [] : JSON.parse(bankAccounts);
    writeFileSync('bank-accounts.json', JSON.stringify([...bankAccounts, params]))
    if (params.shouldThrow) {
      throw new Error(params.shouldThrow);
    }
    log.info('ADDING BANK ACCOUNT', { params });
  }

  async disconnectBankAccounts(params: Commands.DisconnectBankAccounts): Promise<void> {
    let bankAccounts: any = readFileSync('bank-accounts.json').toString();
    bankAccounts = !bankAccounts ? [] : JSON.parse(bankAccounts);
    writeFileSync('clients.json', JSON.stringify(bankAccounts.filter(account => account.accountId !== params.accountId)));
    log.info('DISCONNECT BANK ACCOUNTS', { params });
  }
}
class PostOfficeClient implements PostOffice.Client {
  async addAddress(params: Commands.AddPostalAddress): Promise<void> {
    if (params.shouldThrow) {
      throw new Error(params.shouldThrow);
    }
    log.info('ADDING ADDRESS', { params });
  }

  async clearPostalAddresses(params: Commands.ClearPostalAddresses): Promise<void> {
    log.info('CLEARING ADDRESSES', { params });
  }
}
export const createClients = async (): Promise<BoundedContextClients> => {
  return {
    accounts: new AccountsClient(),
    banking: new BankingClient(),
    clients: new ClientsServiceClient(),
    postOffice: new PostOfficeClient(),
  };
};
