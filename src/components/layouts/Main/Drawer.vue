<template>
<div class="bg-grey-1 full-height q-px-md q-py-lg">
    <div class="q-subheading q-mb-sm">Produkty</div>
    <q-list link class="no-border">
        <q-item class="q-body-1" to="/products/index">
            <q-item-label>Zoznam</q-item-label>
        </q-item>
        <q-item class="q-body-1" to="/products/create">
            <q-item-label>Vytvorenie</q-item-label>
        </q-item>
    </q-list>
    <div class="q-subheading q-mb-sm">Ankety</div>
    <q-list link class="no-border">
        <q-item class="q-body-1" to="/questions/index">
            <q-item-label>Zoznam</q-item-label>
        </q-item>
        <q-item class="q-body-1" to="/questions/create">
            <q-item-label>Vytvorenie</q-item-label>
        </q-item>
    </q-list>
</div>
</template>
