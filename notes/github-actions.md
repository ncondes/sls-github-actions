# Github Actions

Github Actions is a CI/CD tool that allows you to automate your workflow. It is a powerful tool that can be used to build, test, and deploy your code. In this article, we will discuss how to use Github Actions to deploy your code to a server.

- CI/CD pipeline from Github to AWS
- Nicely integrated with Github Events
- No need provision resources
- Can keep the build steps in code

[Reference](https://github.com/features/actions)
[Docs](https://docs.github.com/en/actions)

## Initial Template

We can search on github marketplace for the actions that we want to use. For example, we can search for `serverless` and we will get a list of actions that we can use to deploy our serverless application.

[Serverless Reference](https://github.com/marketplace/actions/serverless)

## Environment Variables

We need to provide AWS credentials to the Github Actions so that it can deploy our code to the server. We can do this by adding the AWS credentials to the Github Secrets.

Now for using the Github Secrets, we need to add the following code to the yml file in the workflow folder.

```yml
environment:
    name: ENVIRONMENT
    url: https://example.com
```

Same if we need to add plugins, we can add the following code to the yml file in the workflow folder. (This is in the docs)	

```yml
  - name: Install Plugin and Deploy
      uses: serverless/github-action@v3.2
      with:
        args: -c "serverless plugin install --name <plugin-name> && serverless deploy"
        entrypoint: /bin/sh
```

