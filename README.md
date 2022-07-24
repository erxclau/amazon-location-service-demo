# amazon-location-service-demo

This is a proof-of-concept for using some [Amazon Location Service](https://aws.amazon.com/location/) APIs to mark a location on a map. This map is centered in Ann Arbor, Michigan.

This uses a native HTML datalist and search input to achieve text autocomplete. These are not very stylistically customizable so it may be better to use a library to create a [combo box](https://en.wikipedia.org/wiki/Combo_box) or search box, or make a custom on your own (though I wouldn't recommend the latter for accessibility and standards reasons).

## Set up AWS

1. Navigate to AWS CloudFormation and create a new stack.
2. In step 1, choose "Upload a template file" in the **Specify template** section.
3. Upload `cloudformation-location-serivce-stack.yaml` as the template file.
4. Specify your stack name, domain, and resource name prefix.
5. Skip step 3 and review your stack in step 4.

## Preview

1. You'll need to copy the `IdentityPoolID` from the stack output and set it to `VITE_AWS_COGNITO_IDENTITY_POOL` in your `.env` file. Note that you don't need to hide the identity pool ID in production. I'm only storing it in an environment variable here because this is a demonstration repository.
2. Install dependencies by running `yarn install`. We're using `vite` as a development server and to retrieve the environment variable.
3. Run `yarn dev` to start the server.
4. Run `yarn build` to build production output and `yarn preview` to run the production build.
