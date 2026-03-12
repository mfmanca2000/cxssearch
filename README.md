# To sync data with Neli
```
npx ts-node getNeliInfo.ts "Bearer xxxx" "68de43fbcbd78b0a7617eb70"
```


# To creat VAPID token
```
node -e "const wp=require('web-push'); const k=wp.generateVAPIDKeys(); console.log(k)"
```