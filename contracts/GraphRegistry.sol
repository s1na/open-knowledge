pragma solidity ^0.4.23;

import "./GraphManager.sol";

contract GraphRegistry {
  event NewGraphManager(
    address addr
  );

  mapping(bytes32 => address) public contracts;

  constructor() public {
    newGraphManager('default');
  }

  function newGraphManager(bytes32 _name) public returns(address addr) {
    require(contracts[_name] == 0);

    GraphManager g = new GraphManager(msg.sender);
    contracts[_name] = g;
    emit NewGraphManager(g);

    return g;
  }
}
