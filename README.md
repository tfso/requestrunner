# requestrunner
Request Runner

## example usage
```javascript
\\ load request runner from config file
var requestrunner = require('requestrunner')('actions.json');

restrequestrunner.run((err, result) => {
    if (err) next(err)
    else console.log(JSON.stringify(result));
});

```
