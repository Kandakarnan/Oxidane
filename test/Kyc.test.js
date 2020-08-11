const { assert } = require('chai')

const Kyc = artifacts.require('Kyc')


require('chai').use(require('chai-as-promised')).should()


contract('Kyc', ([customer]) => {
   before(async () => {
     //Creating Kyc instance
    kyc = await Kyc.new()
     })

  //Checks user signup
  describe('Know Your customer (Kyc)', async () => {
    it('Check Signup', async () => {
      const result = await kyc.signup(0,{from:customer});
      //Triggering registration function
      let user=await kyc.registration(customer);
      //checking customer address
      assert.equal(user.acountno,customer,"account address not registered");
      //Checking Customer category
      assert.equal(user.customertcategory,0,"customer category not same");
    })
  })
})