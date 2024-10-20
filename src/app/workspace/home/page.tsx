import MainContainer from "@/components/sections/shared/MainContainer";
import { Task } from "@/components/sections/task/";
const Home = () => {
  return (
    <MainContainer title="Liste de travail">
      <Task />
    </MainContainer>
  );
};

export default Home;
