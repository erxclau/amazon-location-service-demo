# amazon-location-service-demo

## Set up AWS

1. Navigate to AWS CloudFormation and create a new stack.
2. In step 1, choose "Upload a template file" in the **Specify template** section.
3. Upload `cloudformation-location-serivce-stack.yaml` as the template file.
4. Specify your stack name, domain, and resource name prefix.
5. Skip step 3 and review your stack in step 4.

## Preview

1. You'll need to copy the `IdentityPoolID` from the stack output and set it to `VITE_AWS_COGNITO_IDENTITY_POOL` in your `.env` file. Note that you don't need to hide the identity pool ID in production. I'm only storing it in an environment variable here because this is a demonstration repository.
2. Install `vite` by running `yarn install`. We're using `vite` as a development server and to retrieve the environment variable.
3. Run `yarn dev` to start the server.
