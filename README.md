# Azure Function - App Insights Module

This module extends the base [AF Core Module](https://github.com/nsw-health-pathology/af-core-module)
with extra functionality to support App Insights integration

![Workflow Status](https://img.shields.io/github/workflow/status/nsw-health-pathology/af-app-insights/node-js-build-ci/develop)
![Coverage](https://img.shields.io/coveralls/github/nsw-health-pathology/af-app-insights/develop)
![Licence](https://img.shields.io/github/license/nsw-health-pathology/af-app-insights)

- [Azure Function - App Insights Module](#azure-function---app-insights-module)
  - [Models](#models)
    - [App Insights Logging Service](#app-insights-logging-service)
    - [Timer](#timer)
  - [Services](#services)
    - [App Insights HTTP Data Service](#app-insights-http-data-service)
    - [App Insights Service](#app-insights-service)

## Models

### App Insights Logging Service

This logging service extends the base functionality provided in the core module
but with additional functionality to support tracking exceptions and metrics in app insights

### Timer

The timer class allows for dependency calls or other events to be timed for the purposes of capturing insights

## Services

### App Insights HTTP Data Service

### App Insights Service
