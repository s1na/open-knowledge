pragma solidity ^0.4.23;

contract GraphManager {
  event RootUpdated(
    bytes root
  );

  address public owner;
  bytes public root;

  /* struct CID {
    uint8 mb;
    uint8 v;
    uint8 mc;
    uint8 hashFunction;
    uint8 size;
    bytes32 digest;
  } */

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setRoot(bytes _root) public restricted {
    root = _root;
    emit RootUpdated(_root);
  }
}
