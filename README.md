# local-tunneller

> Small utility to quickly spin up an ec-2 instance for local tunnelling. We use a cloudformation template to create our ec-2 instance and runs script to enable port forwarding.

### Prerequisites
An AWS account with permissions to create ec-2 instances.  It is also assumed that AWS key id and access key are set in the environment. Finally, to set up the ec-2 instance it is also required a valid key-pair exists.

### Usage
To set up an instance for tunnelling run the following:

`node index up  -s testing -k tunnelling key`

* -s is the required arg for the stackname
* -k is the required arg for specifying the key-pair for the ec-2 instance

Once the ec-2 instance has been has been set up the address for the ec-2 will be logged out, you'll use this to set up tunnelling. Take the address returned and add it to the following command:

` ssh -f -N -R :1234:localhost:3000 -i "[YOUR_KEY_PAIR].pem" [EC2_ADDRESS]`

In the above replace add the path to your ec-2 key pair (replacing [YOUR_KEY_PAIR]) and the public dns (or ip) of the ec2 instance (replacing[[EC2_ADDRESS]).  Also you can replace :1234 and :3000 with whatever ports you want.

```
-f Run in the background. This causes ssh to return command prompt immediately.
-N Don’t run a remote command.
-R Set up port forwarding
```
After the above is run, whatever http request that hits `ec2address:1234` will server up content on `localhost:3000`

Once you're done with tunnelling or just want to tear down your ec-2 instance just run the following:

`node index down  -s testing`
