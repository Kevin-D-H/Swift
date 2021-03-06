<template>
  <div>
    <div class="router-header flex flex-wrap items-center mb-6">
      <div class="content-area__heading pr-4">
        <h2 class="mb-1">Add Menu Item</h2>
      </div>
      <vs-divider></vs-divider>
      <vs-button @click="$router.push('/menu')" type="filled" class="mb-4 mr-4">
        <span class="flex items-center">
          <feather-icon icon="ArrowLeftIcon" svgClasses="h-4 w-4 mr-1" />
          <span>Back to Menu</span>
        </span>
      </vs-button>
    </div>
    <div class="vx-row">
      <div class="vx-col sm:w-1/2 w-full mb-2">
        <vx-card
          class="mb-4"
          title="General"
          title-color="primary"
          collapse-action
          subtitle="Provide the base description of the item"
        >
          <vs-dropdown vs-trigger-click class="dd-actions cursor-pointer mr-4 mb-4">
            <div
              class="p-4 shadow-drop rounded-lg d-theme-dark-bg cursor-pointer flex items-center justify-center text-lg font-medium w-32 w-full"
            >
              <span class="mr-2">{{ itemCategoryTitle }}</span>
              <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
            </div>
            <vs-dropdown-menu style="z-index:99999">
              <vs-dropdown-item v-for="category in primaryCategories" :key="category.categoryName">
                <vs-button
                  type="flat"
                  @click="itemCategory = category.categoryName"
                >{{ category.categoryName }}</vs-button>
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>
          <vs-dropdown
            v-if="itemCategory"
            vs-trigger-click
            class="dd-actions cursor-pointer mr-4 mb-4"
          >
            <div
              class="p-4 shadow-drop rounded-lg d-theme-dark-bg cursor-pointer flex items-center justify-center text-lg font-medium w-32 w-full"
            >
              <span class="mr-2">{{ itemSubCategoryTitle }}</span>
              <feather-icon icon="ChevronDownIcon" svgClasses="h-4 w-4" />
            </div>
            <vs-dropdown-menu>
              <vs-dropdown-item
                v-for="category in secondaryCategories"
                :key="category.categoryName"
              >
                <vs-button
                  type="flat"
                  @click="itemSubCategory = category.categoryName"
                >{{ category.categoryName }}</vs-button>
              </vs-dropdown-item>
            </vs-dropdown-menu>
          </vs-dropdown>

          <vs-button @click="addMenuItem()" type="border" class="mb-4 mr-4">
            <span class="flex items-center">
              <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
              <span>Add category</span>
            </span>
          </vs-button>

          <vs-row class="vx-row mb-4">
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
              <vs-input label="Item Name" v-model="itemName" />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
              <vs-input type="number" label="Price (ZAR)" min="0" step="0.5" v-model="itemPrice" />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
              <vs-input
                type="number"
                label="Preperation Time (min)"
                min="0"
                v-model="itemPrepTime"
              />
            </vs-col>
          </vs-row>

          <vs-textarea v-model="itemDescription" label="Item Description" height="200" />
        </vx-card>
      </div>
      <div class="vx-col sm:w-1/2 w-full mb-2">
        <vx-card title="Item Preview" class="mb-4" title-color="primary" collapse-action>
          <h2>{{ itemName }}</h2>
          <p>{{ itemDescription }}</p>
          <vs-divider>Add-ons</vs-divider>

          <vs-list v-for="addOn in itemAddons"
              :key="addOn.id">
            <vs-list-header
              :title="addOn.attributeName"
            ></vs-list-header>

            <vs-list-item
              v-for="attributeValue in addOn.values"
              :key="attributeValue.id"
              :title="attributeValue.name"
              :subtitle="'R'+attributeValue.price"
            ></vs-list-item>
          </vs-list>

          <vs-divider></vs-divider>
          <vs-chip class="mb-2" color="primary">Price: R{{ itemPrice }}</vs-chip>
          <vs-chip class="mb-2" color="success">Preperation: {{ itemPrepTime }}min</vs-chip>
          <vs-divider color="white"></vs-divider>
        </vx-card>
      </div>
    </div>

    <vx-card
      title="Add-ons"
      class="mb-4"
      title-color="primary"
      collapse-action
      subtitle="Specify the item-specific attributes"
    >
      <div class="addOnsList" v-for="addOn in itemAddons" :key="addOn.id">
        <vs-divider color="primary">{{ addOn.attributeName }}</vs-divider>
        <vs-row class="mb-4">
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input label="Attribute Name" v-model="addOn.attributeName" />
          </vs-col>
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <p>How many can they select:</p>
            <vs-input-number
              label="min"
              style="max-width: 200px; margin: 0 auto"
              v-model="addOn.min"
              icon-inc="expand_less"
              icon-dec="expand_more"
            />
          </vs-col>
          <vs-col vs-type="flex" vs-justify="center" vs-align="center" vs-w="4">
            <vs-input-number
              label="max"
              style="max-width: 200px; margin: 0 auto"
              v-model="addOn.max"
              icon-inc="expand_less"
              icon-dec="expand_more"
            />
          </vs-col>
        </vs-row>
        <vs-divider>Attribute Values</vs-divider>
        <div
          class="attributesValuesList"
          v-for="attributeValue in addOn.values"
          :key="attributeValue.id"
        >
          <vs-row class="mb-8">
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="3"></vs-col>
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="2">
              <vs-input label="Value name" v-model="attributeValue.name" />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="2">
              <vs-input
                type="number"
                label="Additional Price (ZAR)"
                min="0"
                step="0.5"
                v-model="attributeValue.price"
              />
            </vs-col>
            <vs-col vs-type="flex" vs-justify="left" vs-align="left" vs-w="2">
              <vs-checkbox v-model="attributeValue.selectedByDefault">selected by default</vs-checkbox>
            </vs-col>
          </vs-row>
        </div>
        <vs-row>
          <vs-col
            class="mt-3"
            vs-offset="4"
            vs-type="flex"
            vs-justify="center"
            vs-align="center"
            vs-w="4"
          >
            <vs-button
              color="dark"
              @click="addAddOnValue(addOn.id)"
              size="small"
              type="border"
              class="mb-4 mr-4"
            >
              <span class="flex items-center">
                <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
                <span>New Value</span>
              </span>
            </vs-button>
          </vs-col>
        </vs-row>
      </div>
      <vs-divider></vs-divider>
      <vs-row>
        <vs-col
          class="mt-3"
          vs-offset="4"
          vs-type="flex"
          vs-justify="center"
          vs-align="center"
          vs-w="4"
        >
          <vs-button @click="addAddOn()" type="border" class="mb-4 mr-4">
            <span class="flex items-center">
              <feather-icon icon="PlusIcon" svgClasses="h-4 w-4 mr-1" />
              <span>New Item Add-On</span>
            </span>
          </vs-button>
        </vs-col>
      </vs-row>
    </vx-card>
    <vx-card
      title="Images"
      class="mb-4"
      title-color="primary"
      collapse-action
      subtitle="Bring the menu item to life with vibrant images"
    >
      <vs-upload
        multiple
        max="3"
        text="Upload Images"
        action="https://jsonplaceholder.typicode.com/posts/"
        @on-success="successUpload"
      />
    </vx-card>
    <vs-row>
      <vs-col
        class="mt-3"
        vs-offset="4"
        vs-type="flex"
        vs-justify="center"
        vs-align="center"
        vs-w="4"
      >
        <vs-button @click="addMenuItem()" type="filled" class="mb-4 mr-4">
          <span class="flex items-center">
            <feather-icon icon="SaveIcon" svgClasses="h-4 w-4 mr-1" />
            <span>Save Item</span>
          </span>
        </vs-button>
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
import modulemenuList from "@/store/menu/menuDataList.js";

export default {
  data() {
    return {
      itemName: "Moroccan Butternut",
      itemDescription:
        "Roasted butternut, spiced chickpeas, candied walnuts, cherry tomatoes, feta & spring onions tossed with mixed lettuce.",
      itemPrice: 20.50,
      itemPrepTime: 10,
      itemCategory: "",
      itemSubCategory: "",
      itemAddons: [
        {
          //TODO: Update itemAddon ids
          id: Math.random(),
          attributeName: "Preperation of Eggs",
          min: 0,
          max: 10,
          values: [
            {
              id: Math.random(),
              name: "fried",
              price: 10,
              selectedByDefault: true,
            },
            {
              id: Math.random(),
              name: "scrambled",
              price: 20,
              selectedByDefault: false,
            },
            {
              id: Math.random(),
              name: "poached",
              price: 30,
              selectedByDefault: false,
            },
          ],
        },
      ],
    };
  },
  computed: {
    restaurantObject() {
      return this.$store.state.menuList.restaurantObject;
    },
    itemCategoryTitle() {
      if (this.itemCategory) return this.itemCategory;
      else return "Item Category";
    },
    itemSubCategoryTitle() {
      if (this.itemSubCategory) return this.itemSubCategory;
      else return "Sub-Category";
    },
    primaryCategories() {
      if (this.restaurantLoaded())
        return this.restaurantObject.categories.filter(
          (i) => i.type === "primary"
        );
      else return null;
    },
    secondaryCategories() {
      if (this.restaurantLoaded())
        return this.restaurantObject.categories.filter(
          (i) => i.type === "secondary"
        );
      else return null;
    },
  },
  methods: {
    successUpload() {
      this.$vs.notify({
        color: "success",
        title: "Upload Success",
        text: "Lorem ipsum dolor sit amet, consectetur",
      });
    },
    restaurantLoaded() {
      if (Object.keys(this.restaurantObject).length === 0) return false;
      else return true;
    },
    addAddOn() {
      var newAddOn = {
        //TODO: Update itemAddon ids
        id: Math.random(),
        attributeName: "Preperation of Eggs",
        min: 0,
        max: 10,
        values: [
          {
            id: Math.random(),
            name: "fried",
            price: 10,
            selectedByDefault: true,
          },
          {
            id: Math.random(),
            name: "scrambled",
            price: 20,
            selectedByDefault: false,
          },
          {
            id: Math.random(),
            name: "poached",
            price: 30,
            selectedByDefault: false,
          },
        ],
      };
      this.itemAddons.push(newAddOn);
    },
    addAddOnValue(id) {
      var newAddOnValue = {
        id: Math.random(),
        name: "fried",
        price: 10,
        selectedByDefault: true,
      };
      this.itemAddons.find((i) => i.id === id).values.push(newAddOnValue);
    },
  },
  created() {
    if (!modulemenuList.isRegistered) {
      this.$store.registerModule("menuList", modulemenuList);
      modulemenuList.isRegistered = true;
    }
    //if menu has not been loaded yet, load it first
    if (!this.restaurantLoaded()) {
      this.$store.dispatch("menuList/listMenuItems");
    }
  },
};
</script>
        