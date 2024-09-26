import { Rating } from "../../components/atom/button/Buttton";

const page = () => {
  return (
    <Rating
      value={4} // This should be the rating value
      placeholder={"hello thon"}
    />
  );
};

export default page;
