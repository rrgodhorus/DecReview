export const CONTRACT_ADDRESS = "0x2c065009530D71a39e3976200AA68E3db149A8B0";

export const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "address", name: "entity", type: "address" }],
    name: "getReviews",
    outputs: [
      {
        components: [
          { internalType: "uint8", name: "score", type: "uint8" },
          { internalType: "string", name: "reviewText", type: "string" },
          { internalType: "address", name: "reviewer", type: "address" },
        ],
        internalType: "struct DecReviewContract.Review[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "reviews",
    outputs: [
      { internalType: "uint8", name: "score", type: "uint8" },
      { internalType: "string", name: "reviewText", type: "string" },
      { internalType: "address", name: "reviewer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "entity", type: "address" },
      { internalType: "uint8", name: "score", type: "uint8" },
      { internalType: "string", name: "reviewText", type: "string" },
    ],
    name: "submitReview",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
