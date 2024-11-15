// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IAlchemix {
    function deposit(uint256 amount) external;
    function borrow(uint256 amount) external;
    function getMaximumBorrowableAmount(address account) external view returns (uint256);
    function getCurrentCollateralRatio(address account) external view returns (uint256);
}

contract LendingProtocol is ReentrancyGuard {
    IAlchemix public alchemix;
    IERC20 public collateralToken;
    IERC20 public borrowToken;
    
    struct LoanPosition {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 timestamp;
    }
    
    mapping(address => LoanPosition) public positions;
    
    constructor(address _alchemix, address _collateralToken, address _borrowToken) {
        alchemix = IAlchemix(_alchemix);
        collateralToken = IERC20(_collateralToken);
        borrowToken = IERC20(_borrowToken);
    }
    
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        collateralToken.transferFrom(msg.sender, address(this), amount);
        collateralToken.approve(address(alchemix), amount);
        alchemix.deposit(amount);
        
        positions[msg.sender].collateralAmount += amount;
        positions[msg.sender].timestamp = block.timestamp;
    }
    
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= getMaxBorrowAmount(msg.sender), "Amount exceeds borrowing limit");
        
        alchemix.borrow(amount);
        borrowToken.transfer(msg.sender, amount);
        
        positions[msg.sender].borrowedAmount += amount;
    }
    
    function getMaxBorrowAmount(address account) public view returns (uint256) {
        return alchemix.getMaximumBorrowableAmount(account);
    }
    
    function getCurrentCollateralRatio(address account) external view returns (uint256) {
        return alchemix.getCurrentCollateralRatio(account);
    }
} 