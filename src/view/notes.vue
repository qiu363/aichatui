<template>
  <div class="chat-container">
    <div ref="chatListRef" class="chat-list">
      <template v-for="item in list" :key="item.id">
        <div v-if="item.type === 'ai'" class="chat-item">
          <div class="chat-item__avatar">
            <img :src="item.avatar" alt="avatar" />
          </div>
          <div class="chat-item__content">
            <div class="chat-item__content--header"> {{ item.name }} </div>
            <div class="chat-item__md markdown-body" v-html="item.content"></div>
            <div class="chat-item__content--footer">
              <div class="chat-item__content--footer--time"> {{ item.date }} </div>
              <a
                v-for="follow in item.followUp"
                :key="follow"
                href="javascript:;"
                @click="sendAi(follow)"
              >
                {{ follow }}
              </a>
            </div>
          </div>
        </div>

        <div v-else class="chat-item">
          <div class="chat-item__avatar">
            <img :src="item.avatar" alt="avatar" />
          </div>
          <div class="chat-item__content">
            <div class="chat-item__content--header"> {{ item.name }} </div>
            <div class="chat-item__md chat-item__mdmy">
              <div v-if="item.type === 'file'" class="chat-item__md__file">
                <Icon name="description" size="80" color="#fff" />
                <div>{{ curFile?.name }}</div>
              </div>
              <template v-else>
                {{ item.content }}
              </template>
            </div>
            <div class="chat-item__content--footer">
              <div class="chat-item__content--footer--time"> {{ item.date }} </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="chat-input">
      <div class="chat-input__inner">
        <Uploader :preview-image="false" :max-count="1" reupload accept="*" :after-read="getFile">
          <Button icon="plus" type="primary">上传简历</Button>
        </Uploader>
      </div>
      <p class="chat-input__tips">内容由AI生成，无法确保真实准确，仅供参考。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, shallowRef, onMounted, nextTick } from 'vue'
  import markdownit from 'markdown-it'
  import {
    showLoadingToast,
    closeToast,
    Uploader,
    Button,
    Icon,
    UploaderAfterRead,
    UploaderFileListItem,
  } from 'vant'
  import dayjs from 'dayjs'
  import { upfile } from '@/utils/api'

  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  })
  const aiTpl = {
    id: new Date().getTime(),
    type: 'ai',
    name: 'HR',
    avatar: 'https://www.jqliu.com/ai/hr.webp',
    content: '',
    date: '',
    followUp: [],
  }
  const userTpl = {
    id: new Date().getTime(),
    type: 'user',
    name: '用户',
    avatar:
      'https://p9-passport.byteacctimg.com/img/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png~300x300.image',
    content: '',
    date: '',
  }

  const curFile = ref<File>()
  const loading = ref(false)
  const list = ref<any>([])
  const chatListRef = shallowRef<HTMLElement>()

  const getFile: UploaderAfterRead = async (file) => {
    showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: '文件上传中...',
    })
    loading.value = true
    const formData = new FormData()
    curFile.value = (file as UploaderFileListItem).file
    formData.append('file', curFile.value as File)

    const res = await upfile(formData)

    closeToast()
    submit(res.data.path)
  }
  const submit = async (url: string) => {
    sendAi(url, 'file')
  }
  const sendAi = (content: string, type = '') => {
    list.value.push({
      ...userTpl,
      id: new Date().getTime(),
      content: content,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      type: type,
    })

    handleAi(content, type)

    handleScroll()
  }
  const handleAi = (prompt: string, type = '') => {
    list.value.push({
      ...aiTpl,
      id: new Date().getTime(),
      content: 'AI分析中...<i class="ai-loading"></i>',
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 1,
      followUp: [] as string[],
    })
    const current = list.value[list.value.length - 1]

    const evtSource = new EventSource(
      import.meta.env.VITE_AI_URL + '/file?content=' + encodeURIComponent(prompt) + '&type=' + type,
    )

    let content = ''
    evtSource.addEventListener('conversation.chat.created', (e) => {
      const data = JSON.parse(e.data)
      current.id = data.conversation_id
    })
    evtSource.addEventListener('conversation.message.delta', (e) => {
      const data = JSON.parse(e.data)

      content += data.content
      current.content = md
        .render(content + '{{ loading }}')
        .replace('{{ loading }}', '<i class="ai-loading"></i>')

      handleScroll()
    })
    evtSource.addEventListener('conversation.message.completed', (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'answer') {
        content = data.content
        current.content = md.render(content)
      } else if (data.type === 'follow_up') {
        current.followUp.push(data.content)
      }
    })
    evtSource.addEventListener('conversation.chat.completed', () => {
      loading.value = false
      current.status = 2

      evtSource.close()

      handleScroll()
    })
    evtSource.addEventListener('conversation.chat.failed', () => {
      loading.value = false
      current.status = 2
      current.content = 'AI分析失败'
      evtSource.close()

      handleScroll()
    })
  }
  const handleScroll = () => {
    nextTick(() => {
      chatListRef.value?.scrollTo({ top: chatListRef.value.scrollHeight })
    })
  }

  onMounted(() => {
    handleScroll()
  })
</script>

<style lang="less" scoped>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .chat-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 0 10px;
    overflow-y: auto;
  }
  .chat-item {
    display: flex;
    padding: 15px;

    &__avatar {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 0;

      img {
        display: block;
        width: 100%;
        border-radius: 50px;
      }
    }
    &__content {
      flex: 1;
      min-width: 0;

      &--header {
        font-weight: 600;
      }
      &--footer {
        a {
          display: block;
          margin: 8px 0 0;
          padding: 8px 15px;
          background: #f5f6fa;
          border-radius: 8px;
          border: solid 1px #e1e4e8;
          color: #888;
          font-size: 14px;
        }

        &--time {
          padding: 4px 0 2px;
          font-size: 12px;
          color: #aaa;
        }
      }
    }
    &__md {
      display: inline-block;
      margin: 10px 0 0;
      padding: 10px 15px;
      background-color: #f5f6fa;
      border-radius: 8px;
      border: solid 1px #e1e4e8;

      &__file {
        text-align: center;
      }
    }
    &__mdmy {
      background: #4d53e8;
      border-color: #4d53e8;
      color: #fff;
    }
  }
  .chat-input {
    padding: 15px;
    border-top: solid 1px #eee;
    .ios-safe-area(15px);

    &__tips {
      padding: 5px 0 0;
      font-size: 12px;
      color: #aaa;
    }

    ::v-deep(.van-cell) {
      padding: 0 50px 0 0;
      font-size: 15px;
    }

    &__inner {
      position: relative;
    }
    &__button {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 50px;
      color: #333;

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
</style>
