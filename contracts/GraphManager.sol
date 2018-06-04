pragma solidity ^0.4.23;

contract GraphManager {
  event RootUpdated(
    bytes root
  );

  address public owner;
  bytes public root = hex'017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa';

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
