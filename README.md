# ERC20DAOToken

Supporting ERC20 standard, this contract is mainly used for DAO.

- Main functionality of this contract is snapshot of balances of all the token holders.
  Every time the proposal creators create the proposal, creates the snapshot by authorized user.
  Snapshot can be used as voting power according to the proposal strategy.
- Another functionality of this contract is transferring tokens to multiple addresses.
  Once the proposal has been approved, sometimes it requires to transfer assets to the specified addresses if it is a funding proposal.

## Functions

<br>

### mint

Mint given amount of tokens to the account, only callable by owner.

| name    |  type   |                        description |
| :------ | :-----: | ---------------------------------: |
| account | address | the account to mint the tokens for |
| amount  | uint256 |       the amount of tokens to mint |

### burn

Burn given amount of tokens from the account, only callable by owner.

| name    |  type   |                        description |
| :------ | :-----: | ---------------------------------: |
| account | address | the account to burn the tokens for |
| amount  | uint256 |       the amount of tokens to burn |

### pause

Pauses the token contract preventing any token mint/transfer/burn operations, can only be called if the contract is unpaused, only callable by owner.

### unpause

Unpauses the token contract preventing any token mint/transfer/burn operations, can only be called if the contract is paused, only callable by owner.

### getCurrentSnapshotId

Get a current snapshot id

### snapshot

Creates a token balance snapshot. Ideally this would be called by the controlling DAO whenever a proposal is made.

### authorizeSnapshotter

Authorizes an account to take snapshots.

| name    |  type   |              description |
| :------ | :-----: | -----------------------: |
| account | address | the account to authorize |

### deauthorizeSnapshotter

Deauthorizes an account to take snapshots.

| name    |  type   |                 description |
| :------ | :-----: | --------------------------: |
| account | address | the account to de-authorize |

### transferBulk

Utility function to transfer tokens to many addresses at once.

| name       |   type    |                     description |
| :--------- | :-------: | ------------------------------: |
| recipients | address[] | the addresses to send tokens to |
| amount     |  uint256  |    the amount of tokens to send |

Return true if the transfer has been success
