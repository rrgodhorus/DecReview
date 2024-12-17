import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
//   console.log(signer);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  return contract;
};

export const getReviews = async (entity) => {
  const contract = await getContract();
  const reviews = await contract.getReviews(entity);
  return reviews;
};

export const submitReview = async(entity, score, reviewText ) => {
    const contract = await getContract();
    const result = await contract.submitReview(entity, score, reviewText);
    return result;
}
