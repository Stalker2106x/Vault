# README

Vault is a pure vanillaJS + PHP landing page for your server.
It shows an application grid similar to a smartphone layout, having each tile routed to a service you use, or used as a note.
It uses a CMS-approach, where zero knowledge is needed either to use it, or to deploy it.

![Example](https://bitbucket.org/stalker2106/vault/raw/master/example/grid.png)

### Contributors
* Maxime 'Stalker2106' Martens
* Victor 'Terag' Rouquette

### How do I get set up?

1. clone the whole repository contents to your htdocs or www folder on your web server
2. TA-DA! Your vault is up and running.

### Configuring your Vault (easy)

When you fire up your vault, a three-dotted button appears on the bottom right corner.
Just click it, unlock it (__default password is "marimba"__) and toggle editor on !

![Editor](https://bitbucket.org/stalker2106/vault/raw/master/example/editor.gif)

### Configuring your Vault (manually)

You can also configure displayed data yourself, by editing app resources.
Vault uses a data folder to store its configuration with the following structure:
  * ./img/ folder contains app-associated images
  * ./apps.json file contains user defined apps
  * ./config.json file contains the vault parameters
the next chapters teach you how to configure config and apps components

#### Global configuration (config.json)

Vault come with a pre-configured config.json file, located inside data folder.
The data is an object with editable properties, which supports the following options:

|Param              |Description
|:-----------------:|:--------------------------------------------------------|
|title              | Name of the vault                                       |
|caption            | Caption displayed under title                           |
|background         | Name of the background (x.jpg)                          |
|forceOrigin        | Only allow login from specified domain/ip               |
|passphrase         | Secret passphrase to authenticate (Default: "marimba")  |

#### Apps configuration (apps.json)

Vault come with a pre-configured config.json file, located inside data folder.
The data is an object with editable properties, which supports the following options:

|Param   |Description                                                 |
|:------:|:-----------------------------------------------------------|
|title   |Title of the app                                            |
|image   |Absolute or relative path to image (can be an external url) |
|url     |Absolute or relative path to target (can be an external url)|
|detail  |Caption text displayed on the app tile                      |
|action  |Behaviour of click (pop-up, redirect, new tab)              |
