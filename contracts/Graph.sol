pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/migrations/Migratable.sol";


contract Graph is Ownable, Migratable {
  event RootUpdated(
    bytes root
  );

  bytes public root = hex"017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa";

  function initialize(address _owner) isInitializer("Graph", "0") public {
    owner = _owner;
  }

  function setRoot(bytes _root) public onlyOwner {
    root = _root;
    emit RootUpdated(_root);
  }
}
