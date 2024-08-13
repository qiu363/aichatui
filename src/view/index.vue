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
            <div class="chat-item__md chat-item__mdmy">{{ item.content }}</div>
            <div class="chat-item__content--footer">
              <div class="chat-item__content--footer--time"> {{ item.date }} </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="chat-input">
      <div class="chat-input__inner">
        <Field
          v-model="aiPromate"
          type="textarea"
          autosize
          placeholder="请输入您要定制的行程规划"
        />
        <div class="chat-input__button" @click="submit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M14.464 8.903a1.027 1.027 0 0 0 0-1.805L2.508.625A1.01 1.01 0 0 0 1.5.645c-.312.186-.5.516-.5.881L2.32 6.68l5.608.82c.321 0 .581.224.581.5 0 .277-.26.5-.581.5-3.161.464-5.03.736-5.607.816L1 14.473a1.021 1.021 0 0 0 1.508.903l11.956-6.473Z"
            ></path>
          </svg>
        </div>
      </div>
      <p class="chat-input__tips">内容由AI生成，无法确保真实准确，仅供参考。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, shallowRef, onMounted, nextTick } from 'vue'
  import markdownit from 'markdown-it'
  import { Field, showToast } from 'vant'
  import dayjs from 'dayjs'

  const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
  })
  const aiTpl = {
    id: new Date().getTime(),
    type: 'ai',
    name: '行程定制',
    avatar:
      'https://p9-arcosite.byteimg.com/tos-cn-i-goo7wpa0wc/35b8379415414e29b27118f1eac79962~tplv-goo7wpa0wc-image.image',
    content: '',
    date: '',
    followUp: [],
  }
  const userTpl = {
    id: new Date().getTime(),
    type: 'user',
    name: 'jqliu',
    avatar:
      'https://p9-passport.byteacctimg.com/img/user-avatar/assets/e7b19241fb224cea967dfaea35448102_1080_1080.png~300x300.image',
    content: '',
    date: '',
  }

  const aiPromate = ref('')
  const loading = ref(false)
  const list = ref<any>([])
  const chatListRef = shallowRef<HTMLElement>()

  const submit = async () => {
    if (loading.value) {
      return
    }

    if (aiPromate.value) {
      sendAi(aiPromate.value)

      aiPromate.value = ''
    } else {
      showToast({
        message: '请输入内容',
      })
    }
  }
  const sendAi = (content: string) => {
    list.value.push({
      ...userTpl,
      id: new Date().getTime(),
      content: content,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    })

    handleAi(content)

    handleScroll()
  }
  const handleAi = (prompt: string) => {
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
      import.meta.env.VITE_AI_URL + '?content=' + encodeURIComponent(prompt),
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
      margin: 10px 0 0;
      padding: 10px 15px;
      background-color: #f5f6fa;
      border-radius: 8px;
      border: solid 1px #e1e4e8;
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
