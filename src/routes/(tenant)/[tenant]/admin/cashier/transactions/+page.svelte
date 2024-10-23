<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;

    let transactions = data.rows
</script>
<table class="table table-zebra">
    <thead>
      <tr>
        <th>Text</th>
        <th>ID</th>
        <th>Created At</th>
        <th>Type</th>
        <th>Created By</th>
        <th>Currency</th>
        <th>Pathname</th>
        <th>Route Name</th>
      </tr>
    </thead>
    <tbody>
      {#each transactions as transaction}
        <tr>
          <td>{transaction.text}</td>
          <td>{transaction.id}</td>
          <td>{transaction.created_at}</td>
          <td>{transaction.type}</td>
          <td>{transaction.created_by}</td>
          <td>{transaction.currency}</td>
          <td>{transaction.pathname}</td>
          <td>{transaction.routeName}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  