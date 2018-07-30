pragma solidity ^0.4.23;

import "zeppelin/token/StandardToken.sol";

contract OpenKnowledgeToken is StandardToken {
  string public symbol = "OKT";
  string public name = "OpenKnowledgeToken";
  uint8 public decimals = 18;

  constructor() public {
    balances[msg.sender] = 1000 * (10 ** uint256(decimals));
    totalSupply = 1000 * (10 ** uint256(decimals));
  }
}
