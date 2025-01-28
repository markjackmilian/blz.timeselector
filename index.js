document.addEventListener('DOMContentLoaded', function () {
    function createTimePickerModal() {
        const modalHTML = `
<div id="timePickerModal" class="modal-overlay hidden">
<div class="modal-container">
  <div class="modal-content">
    <div id="hour-item" class="time-picker-column"></div>
    <div id="minute-item" class="time-picker-column"></div>
  </div>
  <div class="button-group">
    <button id="confirmTime" class="confirm-button primary-button">Conferma</button>
    <button id="closeModal" class="close-button secondary-button">Chiudi</button>
    </div>
</div>
</div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function initializeTimePicker(inputId) {
        createTimePickerModal();

        const modal = document.getElementById('timePickerModal');
        const body = document.body;

        const openModal = () => {
            modal.classList.remove('hidden');
            body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.classList.add('hidden');
            body.style.overflow = '';
        };

        function setupEventListeners() {
            document
                .getElementById(inputId)
                .addEventListener('click', openModal);
            document
                .getElementById('closeModal')
                .addEventListener('click', closeModal);

            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });

            document
                .getElementById('confirmTime')
                .addEventListener('click', () => {
                    const selectedHour = parseInt(hourSelector.getValue());
                    const selectedMinute = parseInt(minuteSelector.getValue());

                    const formattedTime = (time) =>
                        time < 10 ? `0${time}` : time;

                    document.getElementById(inputId).value = `${formattedTime(
                        selectedHour
                    )}:${formattedTime(selectedMinute)}`;
                    closeModal();
                });
        }

        class TimeSelector {
            constructor(options) {
                this.el = document.querySelector(options.el);
                this.source = options.source;
                this.selectedIndex = options.selectedIndex || 0;
                this.itemHeight = 40;
                this.visibleRows = 7;
                this.middleIndex = Math.floor(this.visibleRows / 2);
                this.init();
            }

            init() {
                this.el.innerHTML = `<ul class="time-picker-list">${this.source
                    .map(
                        (item, index) =>
                            `<li data-index="${index}" class="time-picker-item">${item.text}</li>`
                    )
                    .join('')}</ul><div class="time-picker-indicator"></div>`;

                this.list = this.el.querySelector('ul');
                this.items = this.el.querySelectorAll('li');
                this.list.style.transform = `translateY(${
                    -(this.selectedIndex - this.middleIndex) * this.itemHeight
                }px)`;
                this.attachScrollEvents();
                this.updateOpacityItem();
            }

            attachScrollEvents() {
                let startY = 0,
                    scrollStart = 0,
                    isDragging = false;

                const onTouchStart = (e) => {
                    e.stopPropagation();
                    startY = e.touches ? e.touches[0].clientY : e.clientY;
                    scrollStart =
                        parseFloat(
                            this.list.style.transform.replace('translateY(', '')
                        ) || 0;
                    this.list.style.transition = 'none';
                    isDragging = true;
                };

                const onTouchMove = (e) => {
                    if (!isDragging) return;
                    e.stopPropagation();
                    let moveY =
                        (e.touches ? e.touches[0].clientY : e.clientY) - startY;
                    this.list.style.transform = `translateY(${
                        scrollStart + moveY
                    }px)`;
                };

                const onTouchEnd = () => {
                    if (!isDragging) return;
                    isDragging = false;
                    let finalScroll =
                        parseFloat(
                            this.list.style.transform.replace('translateY(', '')
                        ) || 0;
                    let selectedIndex =
                        Math.round(-finalScroll / this.itemHeight) +
                        this.middleIndex;
                    selectedIndex = Math.max(
                        0,
                        Math.min(selectedIndex, this.source.length - 1)
                    );
                    this.select(selectedIndex);
                };

                const onWheel = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    let scrollAmount = e.deltaY;
                    let currentScroll =
                        parseFloat(
                            this.list.style.transform.replace('translateY(', '')
                        ) || 0;
                    this.list.style.transition = 'none';
                    this.list.style.transform = `translateY(${
                        currentScroll - scrollAmount
                    }px)`;
                    let finalScroll =
                        parseFloat(
                            this.list.style.transform.replace('translateY(', '')
                        ) || 0;
                    let selectedIndex =
                        Math.round(-finalScroll / this.itemHeight) +
                        this.middleIndex;
                    selectedIndex = Math.max(
                        0,
                        Math.min(selectedIndex, this.source.length - 1)
                    );
                    this.select(selectedIndex);
                };

                this.el.addEventListener('mousedown', onTouchStart);
                document.addEventListener('mousemove', onTouchMove);
                document.addEventListener('mouseup', onTouchEnd);
                this.el.addEventListener('wheel', onWheel);
                this.el.addEventListener('touchstart', onTouchStart);
                this.el.addEventListener('touchmove', onTouchMove);
                this.el.addEventListener('touchend', onTouchEnd);
            }

            select(index) {
                this.selectedIndex = index;
                this.list.style.transition = 'transform 0.3s ease-out';
                this.list.style.transform = `translateY(${
                    -(index - this.middleIndex) * this.itemHeight
                }px)`;
                this.updateOpacityItem();
            }

            updateOpacityItem() {
                this.items.forEach((item, i) => {
                    item.classList.toggle(
                        'selected-item',
                        i === this.selectedIndex
                    );
                    const distance = Math.abs(i - this.selectedIndex);
                    item.style.opacity =
                        distance < this.middleIndex
                            ? 1 - distance / this.middleIndex
                            : 0.3;
                });
            }

            getValue() {
                return this.source[this.selectedIndex].value;
            }
        }

        const getRange = (start, end) =>
            Array.from({ length: end - start + 1 }, (_, i) => ({
                value: start + i,
                text: start + i,
            }));

        let hourSelector = new TimeSelector({
            el: '#hour-item',
            source: getRange(0, 23),
            selectedIndex: new Date().getHours(),
        });

        let minuteSelector = new TimeSelector({
            el: '#minute-item',
            source: getRange(0, 59),
            selectedIndex: new Date().getMinutes(),
        });

        setupEventListeners();
    }

    initializeTimePicker('timePickerInput');
});
