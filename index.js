require("dotenv").config
const core = require("@actions/core");
const axios = require('axios');

const {
    GITHUB_REPOSITORY: repo,
    GITHUB_REF: branch,
} = process.env;

(async () => {
    try {
      const token = core.getInput("token");
      if(!token){
        return core.setFailed('Missing CircleCI token');
      };
      const orgInput = core.getInput("org");
      const repoInput = core.getInput("repo");
      const branchInput = core.getInput("branch");
      const job = core.getInput("job") || "build";

      const repoName = orgInput && repoInput? `${orgInput}/${repoInput}` : repo;
      const branchName = branchInput || (branch && branch.split('/').pop());
  
      console.log(`Triggering CircleCi job ${repoName} - ${branchName}`)
      const res = await postCircleciAction({
        token,
        repoName,
        branchName,
        job
      });

      console.log(`Job ${res.statusText}`);
      console.log(`Build Number ${res.data.build_num}`);
      console.log(`Build URL ${res.data.build_url}`);

    } catch (error) {
      if(error.response.data && error.response.data.message){
        core.setFailed(error.response.data.message);
      }else{
        core.setFailed(error.message);
      }
    }
  })();
  
  async function postCircleciAction({ token, repoName, branchName, job }) {
    return await axios.post(`https://circleci.com/api/v1.1/project/github/${repoName}/tree/${branchName}`,{
        build_parameters:{
            CIRCLE_JOB : job
        }},{
          headers: {
              'Content-Type': 'application/json',
          },
          withCredentials: true,
          auth:{
            username:token
          }
        }
    );
  }
