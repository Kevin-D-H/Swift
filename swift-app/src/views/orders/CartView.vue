<template>
<v-container fill-height class="pl-0 pt-0 pr-0 pb-0 overflow-y-auto cartOrders overflow-x-hidden" fluid>
    <v-toolbar elevation='2'>
      <v-container>
        <v-row>
          <v-col cols='1' class="pl-0">
            <v-btn icon @click="goBack">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-col>
          <v-col cols='11' class="pl-0 d-flex justify-center align-self-center">
            <v-toolbar-title >Your Order</v-toolbar-title>
          </v-col>
        </v-row>
      </v-container>
    </v-toolbar>
    <v-container v-if="orderInfo().length == 0" py-0>
      <div class="row d-flex flex-column align-stretch align-self-stretch">
        <v-container fluid fill-height class="pa-0">
          <div class="row d-flex flex-column align-self-center align-center">
            <v-avatar class="mb-8" height="140px" width="140px" fab color="primary">
              <v-icon size="65px" class="font-weight-light" color="white">mdi-cart-outline</v-icon>
            </v-avatar>
            <div class="headline mb-3 mt-12 secondary--text">Order Empty</div>
            <div class="subtitle-1 secondary--text">Order some food or drinks here:</div>
          </div>
        </v-container>
      </div>
    </v-container>
    <v-container fill-height v-else class="orderDetailsCart">
      <template>
        <div>
          <v-card v-for="(item,i) in orderInfo()" :key="i" flat>
            <v-list v-for="(orderMenuItem,j) in item.orderInfo.orderItems" :key="j" class="py-2">
              <v-card>
                <v-list-item ripple class="pt-1 pr-0">
                  <v-list-item-content>
                    <v-list-item-title class="mb-2" v-text="item.menuItemName"></v-list-item-title>
                    <div v-for="(orderItem, index) in orderMenuItem.orderSelections.selections" :key="index">
                      <v-list-item-subtitle v-if="!Array.isArray(orderItem.values)">- {{orderItem.name}}: {{orderItem.values}}</v-list-item-subtitle>
                      <v-list-item-subtitle v-else>- {{orderItem.name}}: {{(orderItem.values).join(', ')}}</v-list-item-subtitle>
                    </div>
                  </v-list-item-content>
                  <v-list-item-action class="mr-3">
                    <v-list-item-action-text>R{{item.total}}</v-list-item-action-text>
                    <v-list-item-action-text>
                      <v-btn @click="orderMenuItem.quantity--" fab elevation="2" width="22px" height="22px" class="mr-2">
                        <v-icon size="15px">mdi-minus</v-icon>
                      </v-btn>
                      <div class="body-2 secondary--text" style="display: inline;">{{orderMenuItem.quantity}}</div>
                      <v-btn @click="orderMenuItem.quantity++" fab elevation="2" width="22px" height="22px" class="ml-2" color="primary">
                        <v-icon size="15px">mdi-plus</v-icon>
                      </v-btn>
                    </v-list-item-action-text>
                  </v-list-item-action>
                </v-list-item>
              </v-card>
            </v-list>
          </v-card>
        </div>
      </template>
      <v-row class="mt-5">
        <v-col class="d-flex justify-center pb-1">
          <v-card width="100%" class="pa-1 pr-2">
            <v-container py-0>
              <v-row>
                <v-col cols="9" class="pb-0">
                  <div class="body-1 secondary--text">Subtotal</div>
                </v-col>
                <v-col cols="3" class="pb-0 px-0"> 
                  <div class="body-1 secondary--text d-flex justify-end">R {{subtotal.toFixed(2)}}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="9" class="pb-0">
                  <div class="body-1 secondary--text">Tax(14% VAT included)</div>
                </v-col>
                <v-col cols="3" class="pb-0 px-0">
                  <div class="body-1 secondary--text d-flex justify-end">R {{(subtotal  * 0.14).toFixed(2)}}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="9">
                  <div class="body-1 secondary--text">Waiter Tip</div>
                </v-col>
                <v-col cols="3" class="px-0">
                  <div class="body-1 secondary--text d-flex justify-end">R {{(subtotal * 0.1).toFixed(2)}}</div>
                </v-col>
              </v-row>
              <v-row>
                <v-divider></v-divider>
              </v-row>
              <v-row>
                <v-col cols="9">
                  <div class="body-1 secondary--text font-weight-bold">Total</div>
                </v-col>
                <v-col cols="3" class="px-0">
                  <div class="body-1 secondary--text d-flex justify-end font-weight-bold">R {{calculateTotal()}}</div>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="d-flex justify-space-around" style="position: relative; width:100%; bottom: 0%; margin-top: 25px; margin-bottom: 10px">
        <v-col cols="5" class="pa-0">
            <v-btn rounded color="primary" elevation="2" class="mr-2 body-2" width="100%" @click="goToOrder">Order Now, Pay Later</v-btn>
        </v-col>
        <v-col cols="5" class="pa-0">
            <v-btn rounded color="accent" elevation="2" class="mr-2 body-2" width="100%" @click="toggleAlert">Pay Now</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-overlay relative opacity="0.25" :value="paymentMade" z-index="10">
      <v-avatar elevation="3" color="accent" class="pl-0 pr-0" absolute style="position: absolute; z-index: 12">
          <v-icon size="33px" color="white" v-text="'mdi-check'"></v-icon>
      </v-avatar>
      <v-alert color="white" transition="scale-transition" class="alert" align="center" style="margin-top: 20px;">
        <div style="font-size: 22px !important; color: #343434;" class="pl-8 pr-8 mt-8">Proceed with payment?</div>
        <div class="mt-2" style="font-size: 16px !important; color: #343434">Please note that once you make payment, <br/>you will be checked out of the system.</div>
        <v-row justify="center">
          <v-col cols="12" class="d-flex justify-space-around" flat>
            <v-btn text @click="toggleAlert" class="mt-6 mb-1">
              <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline; text-align: center">Cancel</div>
            </v-btn>
            <v-btn text @click="goToPayment" class="mt-6 mb-1">
              <div class="font-weight-light" style="font-size: 16px !important; color: #404040; text-decoration: underline; text-align: center">Continue</div>
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>
    </v-overlay>

    <NavBar></NavBar>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import NavBar from '@/components/layout/NavBar';

export default {
  data () {
    return {
      subtotal: 0,
      tab: null,
      paymentMade: false,
      items: [
        { img: 'https://source.unsplash.com/uVPV_nV17Tw/800x800/', name: 'Buttermilk Chicken Burger', price: '95.00'},
        { img: 'https://source.unsplash.com/2NaeHe0-p1I/800x800/', name: 'Fruit Salad', price: '85.00'}
      ],
    }
  },
  components: {
    'NavBar': NavBar
  },
  methods: {
    goBack () {
      this.$router.back()
    },
    goToOrder () {
      this.updateOrderFlag(true);
      this.submitOrder();
      // this.$router.push('/orders')
    },
    toggleAlert() {
        this.paymentMade = !this.paymentMade
    },
    goToPayment () {
        this.$router.push('/paymentInformation')
    },
    ...mapActions({
      updateOrderFlag: 'OrderStore/updateOrderFlag',
      submitOrder: 'OrderStore/submitOrder',
    }),
    ...mapGetters({
      orderInfo: "OrderStore/getOrderInfo",
    }),
    calculateTotal() {
      let tax = (this.subtotal * 0.14).toFixed(2);
      let tip = (this.subtotal * 0.1).toFixed(2);
      return (parseFloat(this.subtotal) + parseFloat(tax) + parseFloat(tip)).toFixed(2);
    }
  },
  mounted: function() {
    console.log(this.orderInfo());
    for (let i = 0; i < this.orderInfo().length; i++) {
      this.subtotal += parseFloat(this.orderInfo()[i].total);
    }
  }
}
</script>

<style scoped>
  .cartOrders.container.fill-height {
    align-items: inherit !important;
  }

  .orderDetailsCart {
    display: block;
  }
</style>