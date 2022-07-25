# amazon-location-service-demo

This is a proof-of-concept for using some [Amazon Location Service](https://aws.amazon.com/location/) APIs to mark a location on a map. This map is centered in Ann Arbor, Michigan.

This currently uses [Awesomplete](https://github.com/leaverou/awesomplete) to create the autocomplete searchbox. It is possible to create a similar UI with native HTML using a [datalist](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) and [search input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search) but datalists are not particularly customizable. There are a plethora of other libraries that implement [combo]((https://en.wikipedia.org/wiki/Combo_box)) or search boxes such as [jQuery UI](https://jqueryui.com/autocomplete/) One can also build the search box on their own, though there are accessibility and standards considerations.

## Set up AWS

1. Navigate to AWS CloudFormation and create a new stack.
2. In step 1, choose "Upload a template file" in the **Specify template** section.
3. Upload `cloudformation-location-serivce-stack.yaml` as the template file.
4. Specify your stack name, domain, and resource name prefix.
5. Skip step 3 and review your stack in step 4.

## Preview

1. You'll need to copy the `IdentityPoolID` from the stack output and set it to `VITE_DEV_COGNITO_POOL` in your `.env` file. Note that you don't need to hide the identity pool ID in production. I'm only storing it in an environment variable here because this is a demonstration repository.
2. Install dependencies by running `yarn install`. We're using `vite` as a development server and to retrieve the environment variable.
3. Run `yarn dev` to start the server.
4. Run `yarn build` to build production output and `yarn preview` to run the production build.

You'll probably want to create another identity pool for your production environment since a pool can only have one associated domain. You can set the production pool ID in `VITE_PROD_COGNITO_POOL`.
