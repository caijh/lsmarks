// 雷水书签 Bookmarklet 脚本
// 此脚本在用户点击书签栏中的书签时加载
(function() {
  // 获取当前页面信息
  var url = encodeURIComponent(location.href);
  var title = encodeURIComponent(document.title);
  var description = encodeURIComponent(document.getSelection ? document.getSelection().toString() : '');

  // 创建模态弹窗
  var modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.zIndex = '2147483647';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  // 创建弹窗内容
  var modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.padding = '20px';
  modalContent.style.width = '400px';
  modalContent.style.maxWidth = '90%';
  modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  modalContent.style.position = 'relative';

  // 创建加载中内容
  modalContent.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px;">雷水书签</h3>
      <p style="margin: 0 0 20px 0; color: #666;">正在加载书签选择器...</p>
      <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #3b82f6; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

  // 添加关闭按钮
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '10px';
  closeBtn.style.border = 'none';
  closeBtn.style.background = 'none';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#666';
  closeBtn.onclick = function() {
    document.body.removeChild(modal);
  };

  // 添加元素到页面
  modalContent.appendChild(closeBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // 获取用户的集合列表
  fetch(window.location.origin + '/api/bookmark/collections/my', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // 确保发送cookies，这对于认证很重要
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('未登录或无法获取集合列表');
      }
      return response.json();
    })
    .then(collections => {
      if (!collections || collections.length === 0) {
        throw new Error('没有找到可用的集合');
      }

      // 更新弹窗内容，显示集合列表
      modalContent.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px;">添加到雷水书签</h3>
        <p style="margin: 0 0 20px 0; color: #666;">选择要添加到的集合：</p>
        <div id="collections-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 20px; border: 1px solid #eee; border-radius: 4px;"></div>
      `;

      // 添加集合列表
      var collectionsList = modalContent.querySelector('#collections-list');
      collections.forEach(collection => {
        var collectionItem = document.createElement('div');
        collectionItem.style.padding = '10px';
        collectionItem.style.borderBottom = '1px solid #eee';
        collectionItem.style.cursor = 'pointer';
        collectionItem.style.transition = 'background-color 0.2s';
        collectionItem.innerHTML = `
          <div style="font-weight: 500;">${collection.name}</div>
          <div style="font-size: 12px; color: #666;">${collection.description || '无描述'}</div>
        `;

        // 鼠标悬停效果
        collectionItem.onmouseover = function() {
          this.style.backgroundColor = '#f9fafb';
        };
        collectionItem.onmouseout = function() {
          this.style.backgroundColor = 'transparent';
        };

        // 点击事件
        collectionItem.onclick = function() {
          // 更新弹窗内容，显示添加中状态
          modalContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px;">正在添加书签</h3>
              <p style="margin: 0 0 20px 0; color: #666;">正在将 <strong>${decodeURIComponent(title)}</strong> 添加到 <strong>${collection.name}</strong></p>
              <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #3b82f6; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
            </div>
          `;

          // 添加书签
          fetch(window.location.origin + '/api/bookmark/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // 确保发送cookies，这对于认证很重要
            body: JSON.stringify({
              title: decodeURIComponent(title),
              url: decodeURIComponent(url),
              description: decodeURIComponent(description),
              collection_uuid: collection.uuid,
              category_uuid: collection.categories && collection.categories.length > 0 ? collection.categories[0].uuid : null,
              subcategory_uuid: collection.categories && collection.categories.length > 0 && collection.categories[0].subcategories && collection.categories[0].subcategories.length > 0 ? collection.categories[0].subcategories[0].uuid : null
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('添加书签失败');
              }
              return response.json();
            })
            .then(result => {
              // 更新弹窗内容，显示成功状态
              modalContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3 style="margin: 0 0 16px 0; color: #10b981; font-size: 18px;">书签添加成功</h3>
                  <p style="margin: 0 0 20px 0; color: #666;">已将 <strong>${decodeURIComponent(title)}</strong> 添加到 <strong>${collection.name}</strong></p>
                  <a href="${window.location.origin}/collections/${collection.user_username}/${collection.slug}" style="display: inline-block; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">查看集合</a>
                </div>
              `;

              // 3秒后自动关闭弹窗
              setTimeout(function() {
                if (document.body.contains(modal)) {
                  document.body.removeChild(modal);
                }
              }, 3000);
            })
            .catch(error => {
              // 更新弹窗内容，显示错误状态
              modalContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <h3 style="margin: 0 0 16px 0; color: #ef4444; font-size: 18px;">添加书签失败</h3>
                  <p style="margin: 0 0 20px 0; color: #666;">${error.message}</p>
                  <button style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: 500; cursor: pointer;" onclick="document.body.removeChild(this.closest('.modal'))">关闭</button>
                </div>
              `;
            });
        };

        collectionsList.appendChild(collectionItem);
      });

      // 重新添加关闭按钮
      modalContent.appendChild(closeBtn);
    })
    .catch(error => {
      // 更新弹窗内容，显示错误状态
      modalContent.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <h3 style="margin: 0 0 16px 0; color: #ef4444; font-size: 18px;">无法加载集合</h3>
          <p style="margin: 0 0 20px 0; color: #666;">${error.message}</p>
          <p style="margin: 0 0 20px 0; color: #666;">请确保您已登录雷水书签</p>
          <a href="${window.location.origin}/login" style="display: inline-block; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">去登录</a>
        </div>
      `;

      // 重新添加关闭按钮
      modalContent.appendChild(closeBtn);
    });
})();
